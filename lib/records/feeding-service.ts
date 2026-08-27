import { prisma } from "@/lib/db";
import { getRecordContext } from "@/lib/records/context";
import { canEditRecord } from "@/lib/records/permissions";
import type { RecordResult, RecordsDatabase } from "@/lib/records/types";
import {
  cleanBottleContent,
  cleanBreastSide,
  cleanNotes,
  isInvalidBottleAmount,
} from "@/lib/records/validators";

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
  if (isInvalidBottleAmount(input.amountMl)) {
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
  if (isInvalidBottleAmount(input.amountMl)) {
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
    if (isInvalidBottleAmount(input.amountMl)) {
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
