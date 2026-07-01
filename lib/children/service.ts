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
    findFirst?: (args: {
      where: {
        id: string;
        familyId: string;
        archivedAt: null;
      };
    }) => Promise<ChildRecord | null>;
    update?: (args: {
      where: { id: string };
      data: {
        name?: string;
        birthday?: Date;
        gender?: string | null;
        notes?: string | null;
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

export type UpdateChildInput = CreateChildInput;

type SetCurrentChildResult =
  | { ok: true; childId: string }
  | { ok: false; error: string };

type ChildMutationResult =
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

export async function getAccessibleChild(
  userId: string,
  childId: string,
  db: ChildrenDatabase = prisma,
) {
  const membership = await getActiveFamily(userId, db);

  if (!membership) {
    return null;
  }

  if (db.child.findFirst) {
    return db.child.findFirst({
      where: {
        id: childId,
        familyId: membership.familyId,
        archivedAt: null,
      },
    });
  }

  const children = await listAccessibleChildren(userId, db);
  return children.find((child) => child.id === childId) ?? null;
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

  if (membership.role !== "owner") {
    return { ok: false, error: "Only owners can manage children." };
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

export async function updateChild(
  userId: string,
  childId: string,
  input: UpdateChildInput,
  db: ChildrenDatabase = prisma,
): Promise<ChildMutationResult> {
  const membership = await getActiveFamily(userId, db);

  if (!membership) {
    return { ok: false, error: "Active family membership is required." };
  }

  if (membership.role !== "owner") {
    return { ok: false, error: "Only owners can manage children." };
  }

  const child = await getAccessibleChild(userId, childId, db);
  if (!child) {
    return { ok: false, error: "Child is not accessible." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Child name is required." };
  }

  const birthday = new Date(`${input.birthday}T00:00:00.000Z`);
  if (Number.isNaN(birthday.getTime())) {
    return { ok: false, error: "Birthday is invalid." };
  }

  if (!db.child.update) {
    return { ok: false, error: "Child update is not available." };
  }

  await db.child.update({
    where: { id: child.id },
    data: {
      name,
      birthday,
      gender: input.gender?.trim() || null,
      notes: input.notes?.trim() || null,
    },
  });

  return { ok: true, childId: child.id };
}

export async function setCurrentChild(
  userId: string,
  childId: string,
  db: ChildrenDatabase = prisma,
): Promise<SetCurrentChildResult> {
  const child = await getAccessibleChild(userId, childId, db);

  if (!child) {
    return { ok: false, error: "Child is not accessible." };
  }

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
