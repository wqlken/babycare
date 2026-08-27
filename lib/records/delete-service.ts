import { prisma } from "@/lib/db";
import { getRecordContext } from "@/lib/records/context";
import { canEditRecord } from "@/lib/records/permissions";
import type { DeleteRecordResult, RecordsDatabase } from "@/lib/records/types";

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
