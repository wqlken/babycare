import { beforeEach, describe, expect, test, vi } from "vitest";

const findMany = {
  feedingRecord: vi.fn(async (): Promise<unknown[]> => []),
  diaperRecord: vi.fn(async (): Promise<unknown[]> => []),
  sleepRecord: vi.fn(async (): Promise<unknown[]> => []),
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

function createBottleRecord(index: number) {
  const hour = String(index).padStart(2, "0");
  const time = new Date(`2026-06-25T${hour}:00:00.000Z`);

  return {
    id: `feeding-${index}`,
    childId: "child-1",
    creatorDisplayName: "Owner",
    type: "bottle" as const,
    breastSide: null,
    startTime: time,
    endTime: time,
    amountMl: 90,
    bottleContent: "formula" as const,
    notes: null,
    createdAt: time,
    updatedAt: time,
  };
}

describe("timeline data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.feedingRecord.mockResolvedValue([]);
    findMany.diaperRecord.mockResolvedValue([]);
    findMany.sleepRecord.mockResolvedValue([]);
  });

  test("loads all timeline records for the selected local date", async () => {
    findMany.feedingRecord.mockResolvedValue(
      Array.from({ length: 9 }, (_, index) => createBottleRecord(index + 1)),
    );

    const { getTimelineData } = await import("@/lib/timeline-data");
    const data = await getTimelineData("user-1", "child-1", {
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
    });

    expect(findMany.feedingRecord).toHaveBeenCalledWith({
      where: {
        childId: "child-1",
        deletedAt: null,
        startTime: {
          gte: new Date("2026-06-24T16:00:00.000Z"),
          lt: new Date("2026-06-25T16:00:00.000Z"),
        },
      },
      orderBy: { startTime: "desc" },
    });
    expect(data?.timelineItems).toHaveLength(9);
  });

  test("includes sleep records that overlap the selected local date", async () => {
    const { getTimelineData } = await import("@/lib/timeline-data");

    await getTimelineData("user-1", "child-1", {
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
    });

    expect(findMany.sleepRecord).toHaveBeenCalledWith({
      where: {
        childId: "child-1",
        deletedAt: null,
        startTime: {
          lt: new Date("2026-06-25T16:00:00.000Z"),
        },
        OR: [
          {
            endTime: null,
          },
          {
            endTime: {
              gt: new Date("2026-06-24T16:00:00.000Z"),
            },
          },
        ],
      },
      orderBy: { startTime: "desc" },
    });
  });
});
