import { prisma } from "@/lib/db";

type AccessibleFamily = {
  familyId: string;
  role: "owner" | "caregiver";
  removedAt: Date | null;
};

type ChildRecord = {
  id: string;
  familyId: string;
  name: string;
  birthday: Date;
  gender: string | null;
  notes: string | null;
  archivedAt: Date | null;
};

export type ChildrenDatabase = {
  familyMember: {
    findFirst: (args: {
      where: {
        userId: string;
        removedAt: null;
      };
    }) => Promise<AccessibleFamily | null>;
  };
  child: {
    findMany: (args: {
      where: {
        familyId: string;
        archivedAt: null;
      };
      orderBy: { birthday: "asc" };
    }) => Promise<ChildRecord[]>;
    create: (args: {
      data: {
        familyId: string;
        name: string;
        birthday: Date;
        gender?: string;
        notes?: string;
      };
    }) => Promise<ChildRecord>;
  };
  userPreference: {
    findUnique: (args: {
      where: { userId: string };
    }) => Promise<{ currentChildId: string | null } | null>;
    upsert: (args: {
      where: { userId: string };
      create: {
        userId: string;
        currentChildId: string;
      };
      update: {
        currentChildId: string;
      };
    }) => Promise<unknown>;
  };
};

export type CreateChildInput = {
  name: string;
  birthday: string;
  gender?: string;
  notes?: string;
};

export type CreateChildResult =
  | { ok: true; childId: string }
  | { ok: false; error: string };

export async function getActiveFamily(
  userId: string,
  db: ChildrenDatabase = prisma,
) {
  return db.familyMember.findFirst({
    where: {
      userId,
      removedAt: null,
    },
  });
}

export async function listAccessibleChildren(
  userId: string,
  db: ChildrenDatabase = prisma,
) {
  const membership = await getActiveFamily(userId, db);

  if (!membership) {
    return [];
  }

  return db.child.findMany({
    where: {
      familyId: membership.familyId,
      archivedAt: null,
    },
    orderBy: {
      birthday: "asc",
    },
  });
}

export async function getChildDashboardTarget(
  userId: string,
  db: ChildrenDatabase = prisma,
) {
  const children = await listAccessibleChildren(userId, db);

  if (children.length === 0) {
    return {
      kind: "needs-child" as const,
      href: "/children",
    };
  }

  const preference = await db.userPreference.findUnique({
    where: {
      userId,
    },
  });

  const preferredChild = children.find(
    (child) => child.id === preference?.currentChildId,
  );

  return {
    kind: "child" as const,
    childId: preferredChild?.id ?? children[0].id,
  };
}

export async function createChild(
  userId: string,
  input: CreateChildInput,
  db: ChildrenDatabase = prisma,
): Promise<CreateChildResult> {
  const membership = await getActiveFamily(userId, db);

  if (!membership) {
    return { ok: false, error: "Active family membership is required." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Child name is required." };
  }

  const birthday = new Date(`${input.birthday}T00:00:00.000Z`);
  if (Number.isNaN(birthday.getTime())) {
    return { ok: false, error: "Birthday is invalid." };
  }

  const child = await db.child.create({
    data: {
      familyId: membership.familyId,
      name,
      birthday,
      gender: input.gender?.trim() || undefined,
      notes: input.notes?.trim() || undefined,
    },
  });

  await db.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      currentChildId: child.id,
    },
    update: {
      currentChildId: child.id,
    },
  });

  return {
    ok: true,
    childId: child.id,
  };
}
