import { hash } from "bcryptjs";

export type SeedInput = {
  ownerEmail: string;
  ownerPassword: string;
  ownerDisplayName: string;
  familyName: string;
  childName: string;
  childBirthday: Date;
};

export const DEFAULT_SEED_INPUT: SeedInput = {
  ownerEmail: "owner@example.com",
  ownerPassword: "babycare123",
  ownerDisplayName: "家庭管理员",
  familyName: "我的家庭",
  childName: "宝宝",
  childBirthday: new Date("2026-01-01T00:00:00.000Z"),
};

export function readSeedInput(env: NodeJS.ProcessEnv = process.env): SeedInput {
  return {
    ownerEmail: env.SEED_OWNER_EMAIL ?? DEFAULT_SEED_INPUT.ownerEmail,
    ownerPassword: env.SEED_OWNER_PASSWORD ?? DEFAULT_SEED_INPUT.ownerPassword,
    ownerDisplayName:
      env.SEED_OWNER_DISPLAY_NAME ?? DEFAULT_SEED_INPUT.ownerDisplayName,
    familyName: env.SEED_FAMILY_NAME ?? DEFAULT_SEED_INPUT.familyName,
    childName: env.SEED_CHILD_NAME ?? DEFAULT_SEED_INPUT.childName,
    childBirthday: env.SEED_CHILD_BIRTHDAY
      ? new Date(env.SEED_CHILD_BIRTHDAY)
      : DEFAULT_SEED_INPUT.childBirthday,
  };
}

export async function createPasswordHash(password: string) {
  return hash(password, 12);
}

async function main() {
  const { prisma } = await import("../lib/db");
  const input = readSeedInput();
  const passwordHash = await createPasswordHash(input.ownerPassword);

  const user = await prisma.user.upsert({
    where: { email: input.ownerEmail },
    update: {
      displayName: input.ownerDisplayName,
      passwordHash,
    },
    create: {
      email: input.ownerEmail,
      displayName: input.ownerDisplayName,
      passwordHash,
      preference: {
        create: {},
      },
    },
  });

  const existingMembership = await prisma.familyMember.findFirst({
    where: {
      userId: user.id,
      removedAt: null,
    },
    include: {
      family: {
        include: {
          children: true,
        },
      },
    },
  });

  const family =
    existingMembership?.family ??
    (await prisma.family.create({
      data: {
        name: input.familyName,
        createdBy: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
        children: {
          create: {
            name: input.childName,
            birthday: input.childBirthday,
          },
        },
      },
      include: {
        children: true,
      },
    }));

  const currentChild =
    family.children[0] ??
    (await prisma.child.create({
      data: {
        familyId: family.id,
        name: input.childName,
        birthday: input.childBirthday,
      },
    }));

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    update: {
      currentChildId: currentChild.id,
    },
    create: {
      userId: user.id,
      currentChildId: currentChild.id,
    },
  });

  await prisma.$disconnect();
}

if (process.env.NODE_ENV !== "test") {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
