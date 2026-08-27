import { prisma } from "@/lib/db";

type UserRecord = {
  id: string;
  displayName: string;
};

type MembershipRecord = {
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
};

export type GrowthRecordItem = {
  id: string;
  measuredAt: Date;
  weightKg: number | null;
  lengthCm: number | null;
  notes: string | null;
  creatorDisplayName: string;
};

export type GrowthDatabase = {
  user: {
    findUnique: (args: {
      where: { id: string };
    }) => Promise<UserRecord | null>;
  };
  familyMember: {
    findFirst: (args: {
      where: {
        userId: string;
        removedAt: null;
      };
    }) => Promise<MembershipRecord | null>;
  };
  child: {
    findFirst: (args: {
      where: {
        id: string;
        familyId: string;
        archivedAt: null;
      };
    }) => Promise<ChildRecord | null>;
  };
  growthRecord: {
    create: (args: {
      data: {
        childId: string;
        creatorId: string;
        creatorDisplayName: string;
        measuredAt: Date;
        weightKg?: number | null;
        lengthCm?: number | null;
        notes?: string | null;
      };
    }) => Promise<{ id: string }>;
    findMany: (args: {
      where: {
        childId: string;
        deletedAt: null;
      };
      orderBy: { measuredAt: "asc" };
    }) => Promise<GrowthRecordItem[]>;
  };
};

type CreateGrowthRecordInput = {
  childId: string;
  measuredAt: Date;
  weightKg?: number | null;
  lengthCm?: number | null;
  notes?: string;
  now?: Date;
};

type CreateGrowthRecordResult =
  | { ok: true; recordId: string }
  | { ok: false; error: string };

export type GrowthData =
  | {
      ok: true;
      child: ChildRecord;
      records: GrowthRecordItem[];
      latestWeight: GrowthRecordItem | null;
      latestLength: GrowthRecordItem | null;
    }
  | { ok: false; error: string };

async function getGrowthContext(
  userId: string,
  childId: string,
  db: GrowthDatabase,
) {
  const [user, membership] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.familyMember.findFirst({
      where: {
        userId,
        removedAt: null,
      },
    }),
  ]);

  if (!user || !membership) {
    return { ok: false as const, error: "需要先加入一个有效家庭。" };
  }

  const child = await db.child.findFirst({
    where: {
      id: childId,
      familyId: membership.familyId,
      archivedAt: null,
    },
  });

  if (!child) {
    return { ok: false as const, error: "无法访问该宝宝资料。" };
  }

  return { ok: true as const, child, user };
}

function normalizeOptionalMeasurement(value?: number | null) {
  return value === undefined ? null : value;
}

function validateMeasurementRange(input: {
  weightKg: number | null;
  lengthCm: number | null;
}) {
  if (input.weightKg === null && input.lengthCm === null) {
    return "请至少填写体重或身长/身高。";
  }

  if (
    input.weightKg !== null &&
    (!Number.isFinite(input.weightKg) ||
      input.weightKg < 0.5 ||
      input.weightKg > 40)
  ) {
    return "体重需在 0.5kg 到 40kg 之间。";
  }

  if (
    input.lengthCm !== null &&
    (!Number.isFinite(input.lengthCm) ||
      input.lengthCm < 20 ||
      input.lengthCm > 130)
  ) {
    return "身长/身高需在 20cm 到 130cm 之间。";
  }

  return null;
}

export async function createGrowthRecord(
  userId: string,
  input: CreateGrowthRecordInput,
  db: GrowthDatabase = prisma,
): Promise<CreateGrowthRecordResult> {
  const context = await getGrowthContext(userId, input.childId, db);
  if (!context.ok) return context;

  const measuredAt = input.measuredAt;
  if (Number.isNaN(measuredAt.getTime())) {
    return { ok: false, error: "测量时间无效。" };
  }

  const now = input.now ?? new Date();
  if (measuredAt.getTime() > now.getTime() + 5 * 60_000) {
    return { ok: false, error: "测量时间不能晚于当前时间。" };
  }

  const weightKg = normalizeOptionalMeasurement(input.weightKg);
  const lengthCm = normalizeOptionalMeasurement(input.lengthCm);
  const rangeError = validateMeasurementRange({ weightKg, lengthCm });
  if (rangeError) {
    return { ok: false, error: rangeError };
  }

  const record = await db.growthRecord.create({
    data: {
      childId: context.child.id,
      creatorId: context.user.id,
      creatorDisplayName: context.user.displayName,
      measuredAt,
      weightKg,
      lengthCm,
      notes: input.notes?.trim() || null,
    },
  });

  return { ok: true, recordId: record.id };
}

export async function getGrowthData(
  userId: string,
  childId: string,
  db: GrowthDatabase = prisma,
): Promise<GrowthData> {
  const context = await getGrowthContext(userId, childId, db);
  if (!context.ok) return context;

  const records = await db.growthRecord.findMany({
    where: {
      childId: context.child.id,
      deletedAt: null,
    },
    orderBy: {
      measuredAt: "asc",
    },
  });

  const latestWeight =
    [...records].reverse().find((record) => record.weightKg !== null) ?? null;
  const latestLength =
    [...records].reverse().find((record) => record.lengthCm !== null) ?? null;

  return {
    ok: true,
    child: context.child,
    records,
    latestWeight,
    latestLength,
  };
}
