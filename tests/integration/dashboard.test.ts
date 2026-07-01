import { beforeEach, describe, expect, test, vi } from "vitest";

const findMany = {
  feedingRecord: vi.fn(async () => []),
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
  });

  test("excludes soft-deleted records from list and summary queries", async () => {
    const { getDashboardData } = await import("@/lib/dashboard");

    await getDashboardData("user-1", "child-1");

    expect(findMany.feedingRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { childId: "child-1", deletedAt: null },
      }),
    );
    expect(findMany.diaperRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { childId: "child-1", deletedAt: null },
      }),
    );
    expect(findMany.sleepRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { childId: "child-1", deletedAt: null },
      }),
    );
  });
});
