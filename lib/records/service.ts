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
        type?: "breast";
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
        endTime?: Date;
        amountMl?: number;
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
        endTime?: Date;
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
    return { ok: false as const, error: "Active family membership is required." };
  }

  const child = await db.child.findFirst({
    where: {
      id: childId,
      familyId: membership.familyId,
      archivedAt: null,
    },
  });

  if (!child) {
    return { ok: false as const, error: "Child is not accessible." };
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
    return { ok: false, error: "Bottle amount must be a positive milliliter value." };
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
      error: "An active breastfeeding record already exists.",
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
    return { ok: false, error: "An active sleep record already exists." };
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

export async function stopBreastfeeding(
  userId: string,
  input: {
    childId: string;
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
    return { ok: false, error: "No active breastfeeding record exists." };
  }

  const record = await db.feedingRecord.update({
    where: { id: active.id },
    data: {
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
    return { ok: false, error: "No active sleep record exists." };
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
    updatedAt: Date;
    notes?: string | null;
  },
  db: RecordsDatabase = prisma,
): Promise<RecordResult> {
  if (!Number.isInteger(input.amountMl) || input.amountMl <= 0) {
    return { ok: false, error: "Bottle amount must be a positive milliliter value." };
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
    return { ok: false, error: "Record is not accessible." };
  }

  if (!canEditRecord(context.membership, context.user.id, existing)) {
    return {
      ok: false,
      error: "Only owners or record creators can edit records.",
    };
  }

  if (existing.updatedAt?.getTime() !== input.updatedAt.getTime()) {
    return {
      ok: false,
      error: "Record has changed. Refresh and try again.",
    };
  }

  const record = await db.feedingRecord.update({
    where: { id: existing.id },
    data: {
      amountMl: input.amountMl,
      bottleContent: cleanBottleContent(input.bottleContent),
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

  if (context.membership.role !== "owner") {
    return { ok: false, error: "Only owners can delete records." };
  }

  if (input.kind === "feeding") {
    const record = await db.feedingRecord.findFirst({
      where: {
        id: input.recordId,
        childId: context.child.id,
        deletedAt: null,
      },
    });

    if (!record) {
      return { ok: false, error: "Record is not accessible." };
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
      return { ok: false, error: "Record is not accessible." };
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
    return { ok: false, error: "Record is not accessible." };
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
