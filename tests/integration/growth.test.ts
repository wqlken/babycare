import { describe, expect, test, vi } from "vitest";
import {
  createGrowthRecord,
  getGrowthData,
  updateGrowthRecord,
  type GrowthDatabase,
} from "@/lib/growth/service";

function createGrowthDatabase(options?: {
  userId?: string;
  childArchivedAt?: Date | null;
}) {
  const userId = options?.userId ?? "user-1";
  const childArchivedAt = options?.childArchivedAt ?? null;
  const records: Array<{
    id: string;
    childId: string;
    creatorId: string;
    creatorDisplayName: string;
    measuredAt: Date;
    weightKg: number | null;
    lengthCm: number | null;
    notes: string | null;
    deletedAt: Date | null;
    updatedById?: string | null;
  }> = [];

  const db: GrowthDatabase = {
    user: {
      findUnique: vi.fn(async () => ({
        id: userId,
        displayName: "妈妈",
      })),
    },
    familyMember: {
      findFirst: vi.fn(async () => ({
        familyId: "family-1",
        role: "owner" as const,
        removedAt: null,
      })),
    },
    child: {
      findFirst: vi.fn(async ({ where }) =>
        where.id === "child-1" &&
        where.familyId === "family-1" &&
        childArchivedAt === where.archivedAt
          ? {
              id: "child-1",
              familyId: "family-1",
              name: "小宝",
              birthday: new Date("2026-06-01T00:00:00.000Z"),
              gender: "female",
            }
          : null,
      ),
    },
    growthRecord: {
      create: vi.fn(async ({ data }) => {
        const record = {
          id: `growth-${records.length + 1}`,
          childId: data.childId,
          creatorId: data.creatorId,
          creatorDisplayName: data.creatorDisplayName,
          measuredAt: data.measuredAt,
          weightKg: data.weightKg ?? null,
          lengthCm: data.lengthCm ?? null,
          notes: data.notes ?? null,
          deletedAt: null,
        };
        records.push(record);
        return record;
      }),
      findFirst: vi.fn(async ({ where }) =>
        records.find(
          (record) =>
            record.id === where.id &&
            record.childId === where.childId &&
            record.deletedAt === where.deletedAt,
        ) ?? null,
      ),
      findMany: vi.fn(async ({ where, orderBy }) => {
        expect(orderBy).toEqual({ measuredAt: "asc" });
        return records
          .filter(
            (record) =>
              record.childId === where.childId &&
              record.deletedAt === where.deletedAt,
          )
          .sort((left, right) => left.measuredAt.getTime() - right.measuredAt.getTime())
          .map((record) => ({
            id: record.id,
            measuredAt: record.measuredAt,
            weightKg: record.weightKg,
            lengthCm: record.lengthCm,
            notes: record.notes,
            creatorDisplayName: record.creatorDisplayName,
          }));
      }),
      update: vi.fn(async ({ where, data }) => {
        const index = records.findIndex((record) => record.id === where.id);
        if (index === -1) {
          throw new Error("record not found");
        }

        records[index] = {
          ...records[index],
          measuredAt: data.measuredAt,
          weightKg: data.weightKg,
          lengthCm: data.lengthCm,
          notes: data.notes,
          updatedById: data.updatedById,
        };

        return records[index];
      }),
    },
  };

  return { db, records };
}

describe("growth records", () => {
  test("creates a growth record with creator snapshot", async () => {
    const { db, records } = createGrowthDatabase();

    const result = await createGrowthRecord(
      "user-1",
      {
        childId: "child-1",
        measuredAt: new Date("2026-07-01T02:30:00.000Z"),
        weightKg: 4.25,
        lengthCm: 55.5,
        notes: "  社区测量  ",
        now: new Date("2026-07-01T03:00:00.000Z"),
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "growth-1" });
    expect(records[0]).toMatchObject({
      childId: "child-1",
      creatorId: "user-1",
      creatorDisplayName: "妈妈",
      weightKg: 4.25,
      lengthCm: 55.5,
      notes: "社区测量",
    });
  });

  test("requires at least one measurement value", async () => {
    const { db } = createGrowthDatabase();

    const result = await createGrowthRecord(
      "user-1",
      {
        childId: "child-1",
        measuredAt: new Date("2026-07-01T02:30:00.000Z"),
        now: new Date("2026-07-01T03:00:00.000Z"),
      },
      db,
    );

    expect(result).toEqual({
      ok: false,
      error: "请至少填写体重或身长/身高。",
    });
  });

  test("returns ordered active records and latest measurement by type", async () => {
    const { db, records } = createGrowthDatabase();
    records.push(
      {
        id: "deleted",
        childId: "child-1",
        creatorId: "user-1",
        creatorDisplayName: "妈妈",
        measuredAt: new Date("2026-07-03T00:00:00.000Z"),
        weightKg: 4.8,
        lengthCm: 58,
        notes: null,
        deletedAt: new Date("2026-07-03T01:00:00.000Z"),
      },
      {
        id: "length-only",
        childId: "child-1",
        creatorId: "user-1",
        creatorDisplayName: "妈妈",
        measuredAt: new Date("2026-07-02T00:00:00.000Z"),
        weightKg: null,
        lengthCm: 57.2,
        notes: null,
        deletedAt: null,
      },
      {
        id: "weight-only",
        childId: "child-1",
        creatorId: "user-1",
        creatorDisplayName: "妈妈",
        measuredAt: new Date("2026-07-01T00:00:00.000Z"),
        weightKg: 4.5,
        lengthCm: null,
        notes: null,
        deletedAt: null,
      },
    );

    const result = await getGrowthData("user-1", "child-1", db);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.records.map((record) => record.id)).toEqual([
      "weight-only",
      "length-only",
    ]);
    expect(result.latestWeight?.id).toBe("weight-only");
    expect(result.latestLength?.id).toBe("length-only");
  });

  test("updates an active growth record", async () => {
    const { db, records } = createGrowthDatabase();
    records.push({
      id: "growth-1",
      childId: "child-1",
      creatorId: "user-1",
      creatorDisplayName: "妈妈",
      measuredAt: new Date("2026-07-01T00:00:00.000Z"),
      weightKg: 4.5,
      lengthCm: 56,
      notes: null,
      deletedAt: null,
    });

    const result = await updateGrowthRecord(
      "user-1",
      {
        childId: "child-1",
        recordId: "growth-1",
        measuredAt: new Date("2026-07-02T00:00:00.000Z"),
        weightKg: 4.65,
        lengthCm: 56.8,
        notes: "  儿保复测  ",
        now: new Date("2026-07-02T01:00:00.000Z"),
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "growth-1" });
    expect(records[0]).toMatchObject({
      measuredAt: new Date("2026-07-02T00:00:00.000Z"),
      weightKg: 4.65,
      lengthCm: 56.8,
      notes: "儿保复测",
      updatedById: "user-1",
    });
  });
});
