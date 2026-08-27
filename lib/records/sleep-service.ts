import { prisma } from "@/lib/db";
import { getRecordContext } from "@/lib/records/context";
import { canEditRecord } from "@/lib/records/permissions";
import type {
  ActiveSleepRecord,
  RecordResult,
  RecordsDatabase,
} from "@/lib/records/types";
import { cleanNotes } from "@/lib/records/validators";

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
