import { prisma } from "@/lib/db";
import { serializeRecordsCsv, type ExportCsvRow } from "@/lib/csv";
import { getLocalDayRange } from "@/lib/time";

type MembershipRecord = {
  familyId: string;
  role: "owner" | "caregiver";
  removedAt: Date | null;
};

type ChildRecord = {
  id: string;
  familyId: string;
  name: string;
};

type DateRangeWhere = {
  gte: Date;
  lt: Date;
};

export type ExportDatabase = {
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
  feedingRecord: {
    findMany: (args: {
      where: {
        childId: string;
        deletedAt: null;
        startTime: DateRangeWhere;
      };
      orderBy: { startTime: "asc" };
    }) => Promise<
      Array<{
        id: string;
        childId: string;
        creatorDisplayName: string;
        type: "breast" | "bottle";
        breastSide: "left" | "right" | "both" | "unknown" | null;
        startTime: Date;
        endTime: Date | null;
        amountMl: number | null;
        notes: string | null;
      }>
    >;
  };
  diaperRecord: {
    findMany: (args: {
      where: {
        childId: string;
        deletedAt: null;
        time: DateRangeWhere;
      };
      orderBy: { time: "asc" };
    }) => Promise<
      Array<{
        id: string;
        childId: string;
        creatorDisplayName: string;
        time: Date;
        type: "wet" | "dirty" | "both";
        notes: string | null;
      }>
    >;
  };
  sleepRecord: {
    findMany: (args: {
      where: {
        childId: string;
        deletedAt: null;
        startTime: DateRangeWhere;
      };
      orderBy: { startTime: "asc" };
    }) => Promise<
      Array<{
        id: string;
        childId: string;
        creatorDisplayName: string;
        startTime: Date;
        endTime: Date | null;
        notes: string | null;
      }>
    >;
  };
};

type ExportResult =
  | {
      ok: true;
      csv: string;
      filename: string;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

function parseExportDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  return value;
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function filenameSafe(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]+/g, "-") || "child";
}

export async function buildOwnerExportCsv(
  userId: string,
  input: {
    childId: string;
    from: string;
    to: string;
    timezone?: string;
  },
  db: ExportDatabase = prisma,
): Promise<ExportResult> {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const from = parseExportDate(input.from);
  const to = parseExportDate(input.to);

  if (!from || !to || from > to) {
    return { ok: false, status: 400, error: "Export date range is invalid." };
  }

  const membership = await db.familyMember.findFirst({
    where: {
      userId,
      removedAt: null,
    },
  });

  if (!membership) {
    return { ok: false, status: 401, error: "Authentication is required." };
  }

  if (membership.role !== "owner") {
    return { ok: false, status: 403, error: "Only owners can export records." };
  }

  const child = await db.child.findFirst({
    where: {
      id: input.childId,
      familyId: membership.familyId,
      archivedAt: null,
    },
  });

  if (!child) {
    return { ok: false, status: 404, error: "Child is not accessible." };
  }

  const rangeStart = getLocalDayRange(from, timezone).start;
  const rangeEnd = getLocalDayRange(addDays(to, 1), timezone).start;
  const range = {
    gte: rangeStart,
    lt: rangeEnd,
  };

  const [feedings, diapers, sleeps] = await Promise.all([
    db.feedingRecord.findMany({
      where: {
        childId: child.id,
        deletedAt: null,
        startTime: range,
      },
      orderBy: { startTime: "asc" },
    }),
    db.diaperRecord.findMany({
      where: {
        childId: child.id,
        deletedAt: null,
        time: range,
      },
      orderBy: { time: "asc" },
    }),
    db.sleepRecord.findMany({
      where: {
        childId: child.id,
        deletedAt: null,
        startTime: range,
      },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const rows: ExportCsvRow[] = [
    ...feedings.map((feeding) => ({
      kind: "feeding" as const,
      recordId: feeding.id,
      childId: feeding.childId,
      eventTime: feeding.endTime ?? feeding.startTime,
      startTime: feeding.startTime,
      endTime: feeding.endTime,
      creatorDisplayName: feeding.creatorDisplayName,
      feedingType: feeding.type,
      breastSide: feeding.breastSide,
      amountMl: feeding.amountMl,
      notes: feeding.notes,
    })),
    ...diapers.map((diaper) => ({
      kind: "diaper" as const,
      recordId: diaper.id,
      childId: diaper.childId,
      eventTime: diaper.time,
      startTime: diaper.time,
      endTime: diaper.time,
      creatorDisplayName: diaper.creatorDisplayName,
      diaperType: diaper.type,
      notes: diaper.notes,
    })),
    ...sleeps.map((sleep) => ({
      kind: "sleep" as const,
      recordId: sleep.id,
      childId: sleep.childId,
      eventTime: sleep.endTime ?? sleep.startTime,
      startTime: sleep.startTime,
      endTime: sleep.endTime,
      creatorDisplayName: sleep.creatorDisplayName,
      notes: sleep.notes,
    })),
  ].sort((left, right) => left.eventTime.getTime() - right.eventTime.getTime());

  return {
    ok: true,
    csv: serializeRecordsCsv({ timezone, rows }),
    filename: `babycare-${filenameSafe(child.name)}-${from}-${to}.csv`,
  };
}
