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
  notes?: string | null;
};

type ActiveSleepRecord = {
  id: string;
  childId?: string;
  creatorId?: string;
  startTime?: Date;
  endTime?: Date | null;
  notes?: string | null;
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
        notes?: string | null;
      };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
  diaperRecord: {
    findFirst?: (args: {
      where: {
        childId?: string;
        id?: string;
      };
    }) => Promise<{
      id: string;
      childId?: string;
      creatorId?: string;
      notes?: string | null;
    } | null>;
    create: (args: {
      data: {
        childId: string;
        creatorId: string;
        creatorDisplayName: string;
        time: Date;
        type: "wet" | "dirty" | "both";
        notes?: string | null;
      };
    }) => Promise<{ id: string }>;
    update?: (args: {
      where: { id: string };
      data: { notes?: string | null };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
  sleepRecord: {
    findFirst: (args: {
      where: {
        childId?: string;
        id?: string;
        endTime?: null;
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
      };
    }) => Promise<{ id: string }>;
    delete: (args: { where: { id: string } }) => Promise<{ id: string }>;
  };
};

type RecordResult =
  | { ok: true; recordId: string }
  | { ok: false; error: string };

type DeleteRecordResult = { ok: true } | { ok: false; error: string };

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
    },
  });

  if (!active) {
    return { ok: false, error: "No active breastfeeding record exists." };
  }

  const record = await db.feedingRecord.update({
    where: { id: active.id },
    data: {
      endTime: input.endTime,
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
    },
  });

  if (!active) {
    return { ok: false, error: "No active sleep record exists." };
  }

  const record = await db.sleepRecord.update({
    where: { id: active.id },
    data: {
      endTime: input.endTime,
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

  const record = await db.feedingRecord.update({
    where: { id: existing.id },
    data: {
      amountMl: input.amountMl,
      notes: cleanNotes(input.notes),
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
      },
    });

    if (!record) {
      return { ok: false, error: "Record is not accessible." };
    }

    await db.feedingRecord.delete({ where: { id: record.id } });
    return { ok: true };
  }

  if (input.kind === "diaper") {
    const record = await db.diaperRecord.findFirst?.({
      where: {
        id: input.recordId,
        childId: context.child.id,
      },
    });

    if (!record) {
      return { ok: false, error: "Record is not accessible." };
    }

    await db.diaperRecord.delete({ where: { id: record.id } });
    return { ok: true };
  }

  const record = await db.sleepRecord.findFirst({
    where: {
      id: input.recordId,
      childId: context.child.id,
    },
  });

  if (!record) {
    return { ok: false, error: "Record is not accessible." };
  }

  await db.sleepRecord.delete({ where: { id: record.id } });
  return { ok: true };
}
