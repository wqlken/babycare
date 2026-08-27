import { prisma } from "@/lib/db";
import { getRecordContext } from "@/lib/records/context";
import { canEditRecord } from "@/lib/records/permissions";
import type { RecordResult, RecordsDatabase } from "@/lib/records/types";
import {
  cleanDiaperType,
  cleanNotes,
  cleanStoolColor,
  cleanStoolConsistency,
} from "@/lib/records/validators";

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
