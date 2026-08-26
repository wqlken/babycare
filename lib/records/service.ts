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

type FeedingRecordCreateInput = {
  childId: string;
  creatorId: string;
  creatorDisplayName: string;
  type: "breast" | "bottle";
  breastSide?: "left" | "right" | "both" | "unknown";
  startTime: Date;
  endTime?: Date | null;
  amountMl?: number | null;
  bottleContent?: BottleContent | null;
  notes?: string | null;
};

type SleepRecordCreateInput = {
  childId: string;
  creatorId: string;
  creatorDisplayName: string;
  startTime: Date;
  endTime?: Date | null;
  notes?: string | null;
};

type ActiveFeedingRecord = {
  id: string;
  childId?: string;
  creatorId?: string;
  type?: "breast" | "bottle";
  breastSide?: "left" | "right" | "both" | "unknown" | null;
  startTime?: Date;
  endTime?: Date | null;
  amountMl?: number | null;
  bottleContent?: BottleContent | null;
  notes?: string | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

type ActiveSleepRecord = {
  id: string;
  childId?: string;
  creatorId?: string;
  creatorDisplayName?: string;
  startTime?: Date;
  endTime?: Date | null;
  notes?: string | null;
  updatedAt?: Date;
  deletedAt?: Date | null;
};

export type RecordsDatabase = {
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
    }) => Promise<{ id: string; familyId: string } | null>;
  };
  feedingRecord: {
    findFirst: (args: {
      where: {
        childId?: string;
        id?: string;
        type?: "breast" | "bottle";
        endTime?: null;
        deletedAt?: null;
      };
    }) => Promise<ActiveFeedingRecord | null>;
    create: (args: {
      data: FeedingRecordCreateInput;
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: {
        breastSide?: "left" | "right" | "both" | "unknown" | null;
        startTime?: Date;
        endTime?: Date | null;
        amountMl?: number | null;
        bottleContent?: BottleContent | null;
        notes?: string | null;
        deletedAt?: Date;
        deletedById?: string;
        updatedById?: string;
      };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
  diaperRecord: {
    findFirst?: (args: {
      where: {
        childId?: string;
        id?: string;
        deletedAt?: null;
      };
    }) => Promise<{
      id: string;
      childId?: string;
      creatorId?: string;
      time?: Date;
      type?: "wet" | "dirty" | "both";
      stoolColor?: StoolColor | null;
      stoolConsistency?: StoolConsistency | null;
      notes?: string | null;
      updatedAt?: Date;
      deletedAt?: Date | null;
    } | null>;
    create: (args: {
      data: {
        childId: string;
        creatorId: string;
        creatorDisplayName: string;
        time: Date;
        type: "wet" | "dirty" | "both";
        stoolColor?: StoolColor | null;
        stoolConsistency?: StoolConsistency | null;
        notes?: string | null;
      };
    }) => Promise<{ id: string }>;
    update?: (args: {
      where: { id: string };
      data: {
        time?: Date;
        type?: "wet" | "dirty" | "both";
        stoolColor?: StoolColor | null;
        stoolConsistency?: StoolConsistency | null;
        notes?: string | null;
        deletedAt?: Date;
        deletedById?: string;
        updatedById?: string;
      };
    }) => Promise<{ id: string }>;
    delete?: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
  sleepRecord: {
    findFirst: (args: {
      where: {
        childId?: string;
        id?: string;
        endTime?: null;
        deletedAt?: null;
      };
    }) => Promise<ActiveSleepRecord | null>;
    create: (args: {
      data: SleepRecordCreateInput;
    }) => Promise<{ id: string }>;
    update: (args: {
      where: { id: string };
      data: {
        startTime?: Date;
        endTime?: Date | null;
        notes?: string | null;
        deletedAt?: Date;
        deletedById?: string;
        updatedById?: string;
      };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
};

type RecordResult =
  | { ok: true; recordId: string }
  | { ok: false; error: string };

type DeleteRecordResult = { ok: true } | { ok: false; error: string };

type BottleContent =
  | "formula"
  | "expressed_breast_milk"
  | "mixed"
  | "other"
  | "unknown";

type StoolColor =
  | "yellow"
  | "brown"
  | "green"
  | "black"
  | "red"
  | "white"
  | "other"
  | "unknown";

type StoolConsistency =
  | "watery"
  | "loose"
  | "soft"
  | "formed"
  | "hard"
  | "mucousy"
  | "other"
  | "unknown";

const bottleContents = new Set<string>([
  "formula",
  "expressed_breast_milk",
  "mixed",
  "other",
  "unknown",
]);

const stoolColors = new Set<string>([
  "yellow",
  "brown",
  "green",
  "black",
  "red",
  "white",
  "other",
  "unknown",
]);

const stoolConsistencies = new Set<string>([
  "watery",
  "loose",
  "soft",
  "formed",
  "hard",
  "mucousy",
  "other",
  "unknown",
]);

const breastSides = new Set<string>(["left", "right", "both", "unknown"]);

const diaperTypes = new Set<string>(["wet", "dirty", "both"]);

async function getRecordContext(
  userId: string,
  childId: string,
  db: RecordsDatabase,
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

  return {
    ok: true as const,
    user,
    membership,
    child,
  };
}

function cleanNotes(notes?: string | null) {
  const trimmed = notes?.trim();
  return trimmed ? trimmed : null;
}

function cleanBottleContent(value?: string | null): BottleContent {
  return bottleContents.has(value ?? "") ? (value as BottleContent) : "unknown";
}

function cleanBreastSide(value?: string | null) {
  return breastSides.has(value ?? "")
    ? (value as "left" | "right" | "both" | "unknown")
    : "unknown";
}

function cleanDiaperType(value?: string | null) {
  return diaperTypes.has(value ?? "")
    ? (value as "wet" | "dirty" | "both")
    : "wet";
}

function cleanStoolColor(value?: string | null): StoolColor | null {
  if (!value) return null;
  return stoolColors.has(value) ? (value as StoolColor) : "unknown";
}

function cleanStoolConsistency(value?: string | null): StoolConsistency | null {
  if (!value) return null;
  return stoolConsistencies.has(value) ? (value as StoolConsistency) : "unknown";
}

function canEditRecord(
  membership: MembershipRecord,
  userId: string,
  record: { creatorId?: string },
) {
  return membership.role === "owner" || record.creatorId === userId;
}

export async function createBottleFeeding(
  userId: string,
  input: {
    childId: string;
    amountMl: number;
    bottleContent?: string | null;
    eventTime: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  if (!Number.isInteger(input.amountMl) || input.amountMl <= 0) {
    return { ok: false, error: "瓶喂奶量必须是大于 0 的毫升数。" };
  }

  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const record = await db.feedingRecord.create({
    data: {
      childId: context.child.id,
      creatorId: context.user.id,
      creatorDisplayName: context.user.displayName,
      type: "bottle",
      startTime: input.eventTime,
      endTime: input.eventTime,
      amountMl: input.amountMl,
      bottleContent: cleanBottleContent(input.bottleContent),
      notes: cleanNotes(input.notes),
    },
  });

  return { ok: true, recordId: record.id };
}

export async function startBreastfeeding(
  userId: string,
  input: {
    childId: string;
    breastSide: "left" | "right" | "both" | "unknown";
    startTime: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const active = await db.feedingRecord.findFirst({
    where: {
      childId: context.child.id,
      type: "breast",
      endTime: null,
      deletedAt: null,
    },
  });

  if (active) {
    return {
      ok: false,
      error: "当前已有一段进行中的母乳记录，请先结束后再开始新的母乳记录。",
    };
  }

  const record = await db.feedingRecord.create({
    data: {
      childId: context.child.id,
      creatorId: context.user.id,
      creatorDisplayName: context.user.displayName,
      type: "breast",
      breastSide: input.breastSide,
      startTime: input.startTime,
      endTime: null,
      amountMl: null,
      notes: cleanNotes(input.notes),
    },
  });

  return { ok: true, recordId: record.id };
}

export async function createDiaper(
  userId: string,
  input: {
    childId: string;
    type: "wet" | "dirty" | "both";
    stoolColor?: string | null;
    stoolConsistency?: string | null;
    time: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const record = await db.diaperRecord.create({
    data: {
      childId: context.child.id,
      creatorId: context.user.id,
      creatorDisplayName: context.user.displayName,
      type: input.type,
      stoolColor: input.type === "wet" ? null : cleanStoolColor(input.stoolColor),
      stoolConsistency:
        input.type === "wet" ? null : cleanStoolConsistency(input.stoolConsistency),
      time: input.time,
      notes: cleanNotes(input.notes),
    },
  });

  return { ok: true, recordId: record.id };
}

export async function startSleep(
  userId: string,
  input: {
    childId: string;
    startTime: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const active = await db.sleepRecord.findFirst({
    where: {
      childId: context.child.id,
      endTime: null,
      deletedAt: null,
    },
  });

  if (active) {
    return {
      ok: false,
      error: "当前已有一段进行中的睡眠，请先结束后再开始新的睡眠。",
    };
  }

  const record = await db.sleepRecord.create({
    data: {
      childId: context.child.id,
      creatorId: context.user.id,
      creatorDisplayName: context.user.displayName,
      startTime: input.startTime,
      endTime: null,
      notes: cleanNotes(input.notes),
    },
  });

  return { ok: true, recordId: record.id };
}

export async function getActiveSleep(
  userId: string,
  input: {
    childId: string;
  },
  db: RecordsDatabase = prisma,
): Promise<
  | { ok: true; activeSleep: ActiveSleepRecord | null }
  | { ok: false; error: string }
> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const activeSleep = await db.sleepRecord.findFirst({
    where: {
      childId: context.child.id,
      endTime: null,
      deletedAt: null,
    },
  });

  return { ok: true, activeSleep };
}

export async function stopBreastfeeding(
  userId: string,
  input: {
    childId: string;
    breastSide?: string | null;
    endTime: Date;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const active = await db.feedingRecord.findFirst({
    where: {
      childId: context.child.id,
      type: "breast",
      endTime: null,
      deletedAt: null,
    },
  });

  if (!active) {
    return { ok: false, error: "当前没有进行中的母乳记录。" };
  }

  const record = await db.feedingRecord.update({
    where: { id: active.id },
    data: {
      breastSide: cleanBreastSide(input.breastSide),
      endTime: input.endTime,
      updatedById: context.user.id,
    },
  });

  return { ok: true, recordId: record.id };
}

export async function stopSleep(
  userId: string,
  input: {
    childId: string;
    endTime: Date;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const active = await db.sleepRecord.findFirst({
    where: {
      childId: context.child.id,
      endTime: null,
      deletedAt: null,
    },
  });

  if (!active) {
    return { ok: false, error: "当前没有进行中的睡眠记录。" };
  }

  const record = await db.sleepRecord.update({
    where: { id: active.id },
    data: {
      endTime: input.endTime,
      updatedById: context.user.id,
    },
  });

  return { ok: true, recordId: record.id };
}

export async function updateBottleFeeding(
  userId: string,
  input: {
    childId: string;
    recordId: string;
    amountMl: number;
    bottleContent?: string | null;
    eventTime?: Date;
    updatedAt: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  if (!Number.isInteger(input.amountMl) || input.amountMl <= 0) {
    return { ok: false, error: "瓶喂奶量必须是大于 0 的毫升数。" };
  }

  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const existing = await db.feedingRecord.findFirst({
    where: {
      id: input.recordId,
      childId: context.child.id,
      deletedAt: null,
    },
  });

  if (!existing) {
    return { ok: false, error: "无法访问该记录。" };
  }

  if (!canEditRecord(context.membership, context.user.id, existing)) {
    return {
      ok: false,
      error: "只有家庭管理员或记录创建者可以编辑记录。",
    };
  }

  if (existing.updatedAt?.getTime() !== input.updatedAt.getTime()) {
    return {
      ok: false,
      error: "记录已被更新，请刷新后重试。",
    };
  }

  const record = await db.feedingRecord.update({
    where: { id: existing.id },
    data: {
      ...(input.eventTime
        ? {
            startTime: input.eventTime,
            endTime: input.eventTime,
          }
        : {}),
      amountMl: input.amountMl,
      bottleContent: cleanBottleContent(input.bottleContent),
      notes: cleanNotes(input.notes),
      updatedById: context.user.id,
    },
  });

  return { ok: true, recordId: record.id };
}

export async function updateFeedingRecord(
  userId: string,
  input: {
    childId: string;
    recordId: string;
    type: "breast" | "bottle";
    breastSide?: string | null;
    startTime: Date;
    endTime?: Date | null;
    amountMl?: number | null;
    bottleContent?: string | null;
    updatedAt: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  if (input.type === "bottle") {
    if (!Number.isInteger(input.amountMl) || (input.amountMl ?? 0) <= 0) {
      return { ok: false, error: "瓶喂奶量必须是大于 0 的毫升数。" };
    }
  } else if (input.endTime && input.endTime <= input.startTime) {
    return { ok: false, error: "结束时间必须晚于开始时间。" };
  }

  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const existing = await db.feedingRecord.findFirst({
    where: {
      id: input.recordId,
      childId: context.child.id,
      deletedAt: null,
    },
  });

  if (!existing) {
    return { ok: false, error: "无法访问该记录。" };
  }

  if (!canEditRecord(context.membership, context.user.id, existing)) {
    return {
      ok: false,
      error: "只有家庭管理员或记录创建者可以编辑记录。",
    };
  }

  if (existing.updatedAt?.getTime() !== input.updatedAt.getTime()) {
    return {
      ok: false,
      error: "记录已被更新，请刷新后重试。",
    };
  }

  if (existing.type && existing.type !== input.type) {
    return { ok: false, error: "记录类型不匹配。" };
  }

  const record = await db.feedingRecord.update({
    where: { id: existing.id },
    data:
      input.type === "bottle"
        ? {
            breastSide: null,
            startTime: input.startTime,
            endTime: input.startTime,
            amountMl: input.amountMl ?? null,
            bottleContent: cleanBottleContent(input.bottleContent),
            notes: cleanNotes(input.notes),
            updatedById: context.user.id,
          }
        : {
            breastSide: cleanBreastSide(input.breastSide),
            startTime: input.startTime,
            endTime: input.endTime ?? null,
            amountMl: null,
            bottleContent: null,
            notes: cleanNotes(input.notes),
            updatedById: context.user.id,
          },
  });

  return { ok: true, recordId: record.id };
}

export async function updateDiaperRecord(
  userId: string,
  input: {
    childId: string;
    recordId: string;
    type: string;
    stoolColor?: string | null;
    stoolConsistency?: string | null;
    time: Date;
    updatedAt: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const existing = await db.diaperRecord.findFirst?.({
    where: {
      id: input.recordId,
      childId: context.child.id,
      deletedAt: null,
    },
  });

  if (!existing) {
    return { ok: false, error: "无法访问该记录。" };
  }

  if (!canEditRecord(context.membership, context.user.id, existing)) {
    return {
      ok: false,
      error: "只有家庭管理员或记录创建者可以编辑记录。",
    };
  }

  if (existing.updatedAt?.getTime() !== input.updatedAt.getTime()) {
    return {
      ok: false,
      error: "记录已被更新，请刷新后重试。",
    };
  }

  const type = cleanDiaperType(input.type);
  const record = await db.diaperRecord.update?.({
    where: { id: existing.id },
    data: {
      type,
      time: input.time,
      stoolColor: type === "wet" ? null : cleanStoolColor(input.stoolColor),
      stoolConsistency:
        type === "wet" ? null : cleanStoolConsistency(input.stoolConsistency),
      notes: cleanNotes(input.notes),
      updatedById: context.user.id,
    },
  });

  return { ok: true, recordId: record?.id ?? existing.id };
}

export async function updateSleepRecord(
  userId: string,
  input: {
    childId: string;
    recordId: string;
    startTime: Date;
    endTime?: Date | null;
    updatedAt: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  if (input.endTime && input.endTime <= input.startTime) {
    return { ok: false, error: "结束时间必须晚于开始时间。" };
  }

  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  const existing = await db.sleepRecord.findFirst({
    where: {
      id: input.recordId,
      childId: context.child.id,
      deletedAt: null,
    },
  });

  if (!existing) {
    return { ok: false, error: "无法访问该记录。" };
  }

  if (!canEditRecord(context.membership, context.user.id, existing)) {
    return {
      ok: false,
      error: "只有家庭管理员或记录创建者可以编辑记录。",
    };
  }

  if (existing.updatedAt?.getTime() !== input.updatedAt.getTime()) {
    return {
      ok: false,
      error: "记录已被更新，请刷新后重试。",
    };
  }

  const record = await db.sleepRecord.update({
    where: { id: existing.id },
    data: {
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      notes: cleanNotes(input.notes),
      updatedById: context.user.id,
    },
  });

  return { ok: true, recordId: record.id };
}

export async function deleteRecord(
  userId: string,
  input: {
    childId: string;
    kind: "feeding" | "diaper" | "sleep";
    recordId: string;
  },
  db: RecordsDatabase = prisma,
): Promise<DeleteRecordResult> {
  const context = await getRecordContext(userId, input.childId, db);
  if (!context.ok) return context;

  if (input.kind === "feeding") {
    const record = await db.feedingRecord.findFirst({
      where: {
        id: input.recordId,
        childId: context.child.id,
        deletedAt: null,
      },
    });

    if (!record) {
      return { ok: false, error: "无法访问该记录。" };
    }

    if (!canEditRecord(context.membership, context.user.id, record)) {
      return {
        ok: false,
        error: "只有家庭管理员或记录创建者可以删除记录。",
      };
    }

    await db.feedingRecord.update({
      where: { id: record.id },
      data: {
        deletedAt: new Date(),
        deletedById: context.user.id,
      },
    });
    return { ok: true };
  }

  if (input.kind === "diaper") {
    const record = await db.diaperRecord.findFirst?.({
      where: {
        id: input.recordId,
        childId: context.child.id,
        deletedAt: null,
      },
    });

    if (!record) {
      return { ok: false, error: "无法访问该记录。" };
    }

    if (!canEditRecord(context.membership, context.user.id, record)) {
      return {
        ok: false,
        error: "只有家庭管理员或记录创建者可以删除记录。",
      };
    }

    await db.diaperRecord.update?.({
      where: { id: record.id },
      data: {
        deletedAt: new Date(),
        deletedById: context.user.id,
      },
    });
    return { ok: true };
  }

  const record = await db.sleepRecord.findFirst({
    where: {
      id: input.recordId,
      childId: context.child.id,
      deletedAt: null,
    },
  });

  if (!record) {
    return { ok: false, error: "无法访问该记录。" };
  }

  if (!canEditRecord(context.membership, context.user.id, record)) {
    return {
      ok: false,
      error: "只有家庭管理员或记录创建者可以删除记录。",
    };
  }

  await db.sleepRecord.update({
    where: { id: record.id },
    data: {
      deletedAt: new Date(),
      deletedById: context.user.id,
    },
  });
  return { ok: true };
}
