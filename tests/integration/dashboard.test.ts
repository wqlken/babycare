import { beforeEach, describe, expect, test, vi } from "vitest";

const findMany = {
  feedingRecord: vi.fn(async () => [
    {
      id: "feeding-1",
      childId: "child-1",
      creatorDisplayName: "Owner",
      type: "bottle" as const,
      breastSide: null,
      startTime: new Date("2026-06-25T01:00:00.000Z"),
      endTime: new Date("2026-06-25T01:00:00.000Z"),
      amountMl: 90,
      notes: null,
      createdAt: new Date("2026-06-25T01:00:00.000Z"),
      updatedAt: new Date("2026-06-25T01:00:00.000Z"),
    },
  ]),
  diaperRecord: vi.fn(async () => []),
  sleepRecord: vi.fn(async () => []),
};

vi.mock("@/lib/db", () => ({
  prisma: {
    feedingRecord: { findMany: findMany.feedingRecord },
    diaperRecord: { findMany: findMany.diaperRecord },
    sleepRecord: { findMany: findMany.sleepRecord },
  },
}));

vi.mock("@/lib/children/service", () => ({
  getAccessibleChild: vi.fn(async () => ({
    id: "child-1",
    name: "Baby",
    familyId: "family-1",
  })),
}));

describe("dashboard data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-25T04:00:00.000Z"));
  });

  test("excludes soft-deleted records from list and summary queries", async () => {
    const { getDashboardData } = await import("@/lib/dashboard");

    await getDashboardData("user-1", "child-1");

    expect(findMany.feedingRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          childId: "child-1",
          deletedAt: null,
        }),
      }),
    );
    expect(findMany.diaperRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          childId: "child-1",
          deletedAt: null,
        }),
      }),
    );
    expect(findMany.sleepRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          childId: "child-1",
          deletedAt: null,
        }),
      }),
    );
  });

  test("loads records across the seven-day summary range", async () => {
    const { getDashboardData } = await import("@/lib/dashboard");

    const dashboard = await getDashboardData("user-1", "child-1");

    expect(findMany.feedingRecord).toHaveBeenCalledWith({
      where: {
        childId: "child-1",
        deletedAt: null,
        startTime: {
          gte: new Date("2026-06-18T16:00:00.000Z"),
          lt: new Date("2026-06-25T16:00:00.000Z"),
        },
      },
      orderBy: { startTime: "desc" },
    });
    expect(dashboard?.sevenDaySummary).toHaveLength(7);
    expect(dashboard?.sevenDaySummary.at(-1)).toMatchObject({
      date: "2026-06-25",
      feedingCount: 1,
      bottleMl: 90,
    });
  });
});
