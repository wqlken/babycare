import { describe, expect, test, vi } from "vitest";
import { buildOwnerExportCsv, type ExportDatabase } from "@/lib/exports/service";

function createExportDatabase(role: "owner" | "caregiver" = "owner"): ExportDatabase {
  return {
    familyMember: {
      findFirst: vi.fn(async ({ where }) => {
        if (where.userId !== "user-1") return null;

        return {
          familyId: "family-1",
          role,
          removedAt: null,
        };
      }),
    },
    child: {
      findFirst: vi.fn(async ({ where }) =>
        where.id === "child-1" && where.familyId === "family-1"
          ? { id: "child-1", familyId: "family-1", name: "Baby" }
          : null,
      ),
    },
    feedingRecord: {
      findMany: vi.fn(async () => [
        {
          id: "feeding-1",
          childId: "child-1",
          creatorDisplayName: "Owner",
          type: "bottle" as const,
          breastSide: null,
          startTime: new Date("2026-06-25T01:00:00.000Z"),
          endTime: new Date("2026-06-25T01:00:00.000Z"),
          amountMl: 120,
          notes: "finished",
        },
      ]),
    },
    diaperRecord: {
      findMany: vi.fn(async () => [
        {
          id: "diaper-1",
          childId: "child-1",
          creatorDisplayName: "Owner",
          time: new Date("2026-06-25T02:00:00.000Z"),
          type: "wet" as const,
          notes: null,
        },
      ]),
    },
    sleepRecord: {
      findMany: vi.fn(async () => [
        {
          id: "sleep-1",
          childId: "child-1",
          creatorDisplayName: "Caregiver",
          startTime: new Date("2026-06-25T03:00:00.000Z"),
          endTime: new Date("2026-06-25T04:00:00.000Z"),
          notes: "nap",
        },
      ]),
    },
  };
}

describe("owner CSV export", () => {
  test("exports accessible child records in date range and excludes soft-deleted rows", async () => {
    const db = createExportDatabase("owner");

    const result = await buildOwnerExportCsv(
      "user-1",
      {
        childId: "child-1",
        from: "2026-06-25",
        to: "2026-06-26",
        timezone: "Asia/Shanghai",
      },
      db,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.filename).toBe("babycare-Baby-2026-06-25-2026-06-26.csv");
    expect(result.csv).toContain("feeding,feeding-1");
    expect(result.csv).toContain("diaper,diaper-1");
    expect(result.csv).toContain("sleep,sleep-1");
    expect(result.csv).toContain("Caregiver");
    expect(db.feedingRecord.findMany).toHaveBeenCalledWith({
      where: {
        childId: "child-1",
        deletedAt: null,
        startTime: {
          gte: new Date("2026-06-24T16:00:00.000Z"),
          lt: new Date("2026-06-26T16:00:00.000Z"),
        },
      },
      orderBy: { startTime: "asc" },
    });
    expect(db.diaperRecord.findMany).toHaveBeenCalledWith({
      where: {
        childId: "child-1",
        deletedAt: null,
        time: {
          gte: new Date("2026-06-24T16:00:00.000Z"),
          lt: new Date("2026-06-26T16:00:00.000Z"),
        },
      },
      orderBy: { time: "asc" },
    });
    expect(db.sleepRecord.findMany).toHaveBeenCalledWith({
      where: {
        childId: "child-1",
        deletedAt: null,
        startTime: {
          gte: new Date("2026-06-24T16:00:00.000Z"),
          lt: new Date("2026-06-26T16:00:00.000Z"),
        },
      },
      orderBy: { startTime: "asc" },
    });
  });

  test("rejects caregivers", async () => {
    const db = createExportDatabase("caregiver");

    await expect(
      buildOwnerExportCsv(
        "user-1",
        {
          childId: "child-1",
          from: "2026-06-25",
          to: "2026-06-26",
          timezone: "Asia/Shanghai",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      status: 403,
      error: "Only owners can export records.",
    });
  });
});
