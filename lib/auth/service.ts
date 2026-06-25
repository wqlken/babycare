import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export type AuthDatabase = {
  user: {
    count: () => Promise<number>;
    create: (args: {
      data: {
        email: string;
        passwordHash: string;
        displayName: string;
      };
    }) => Promise<{ id: string }>;
    findUnique: (args: {
      where: { email: string };
    }) => Promise<{ id: string; passwordHash: string } | null>;
  };
  family: {
    create: (args: {
      data: {
        name: string;
        createdBy: string;
        members: {
          create: {
            userId: string;
            role: "owner";
          };
        };
      };
    }) => Promise<{ id: string }>;
  };
  userPreference: {
    create: (args: { data: { userId: string } }) => Promise<unknown>;
  };
};

export type RegisterInput = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(
  input: RegisterInput,
  db: AuthDatabase = prisma,
): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const displayName = input.displayName.trim();

  if (!email || !displayName) {
    return { ok: false, error: "Email and display name are required." };
  }

  const existingUsers = await db.user.count();
  if (existingUsers > 0) {
    return { ok: false, error: "Registration requires an invitation." };
  }

  const passwordHash = await hashPassword(input.password);
  const user = await db.user.create({
    data: {
      email,
      displayName,
      passwordHash,
    },
  });

  await db.family.create({
    data: {
      name: "我的家庭",
      createdBy: user.id,
      members: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  });

  await db.userPreference.create({
    data: {
      userId: user.id,
    },
  });

  return { ok: true, userId: user.id };
}

export async function authenticateUser(
  input: LoginInput,
  db: AuthDatabase = prisma,
): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }

  return { ok: true, userId: user.id };
}
