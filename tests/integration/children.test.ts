import { describe, expect, test, vi } from "vitest";
import {
  createChild,
  getChildDashboardTarget,
  setCurrentChild,
  type ChildrenDatabase,
} from "@/lib/children/service";

function createChildrenDatabase(): ChildrenDatabase {
  const children: Array<{
    id: string;
    familyId: string;
    name: string;
    birthday: Date;
    gender: string | null;
    notes: string | null;
    archivedAt: Date | null;
  }> = [];

  let currentChildId: string | null = null;

  return {
    familyMember: {
      findFirst: vi.fn(async () => ({
        familyId: "family-1",
        role: "owner" as const,
        removedAt: null,
      })),
    },
    child: {
      findMany: vi.fn(async () => children),
      create: vi.fn(async ({ data }) => {
        const child = {
          id: `child-${children.length + 1}`,
          familyId: data.familyId,
          name: data.name,
          birthday: data.birthday,
          gender: data.gender ?? null,
          notes: data.notes ?? null,
          archivedAt: null,
        };
        children.push(child);
        return child;
      }),
    },
    userPreference: {
      findUnique: vi.fn(async () => ({ currentChildId })),
      upsert: vi.fn(async ({ create, update }) => {
        currentChildId = update.currentChildId ?? create.currentChildId ?? null;
        return { currentChildId };
      }),
    },
  };
}

describe("child onboarding", () => {
  test("routes users with no children to child creation", async () => {
    const db = createChildrenDatabase();

    await expect(getChildDashboardTarget("user-1", db)).resolves.toEqual({
      kind: "needs-child",
      href: "/children",
    });
  });

  test("creating a child sets it as the current child", async () => {
    const db = createChildrenDatabase();

    const result = await createChild(
      "user-1",
      {
        name: "宝宝",
        birthday: "2026-01-01",
        gender: "female",
        notes: "喜欢午睡",
      },
      db,
    );

    expect(result).toEqual({ ok: true, childId: "child-1" });
    expect(db.userPreference.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      create: {
        userId: "user-1",
        currentChildId: "child-1",
      },
      update: {
        currentChildId: "child-1",
      },
    });
    await expect(getChildDashboardTarget("user-1", db)).resolves.toEqual({
      kind: "child",
      childId: "child-1",
    });
  });

  test("users can switch their current child to another accessible child", async () => {
    const db = createChildrenDatabase();

    await createChild(
      "user-1",
      {
        name: "大宝",
        birthday: "2024-01-01",
      },
      db,
    );
    await createChild(
      "user-1",
      {
        name: "小宝",
        birthday: "2026-01-01",
      },
      db,
    );

    await expect(setCurrentChild("user-1", "child-2", db)).resolves.toEqual({
      ok: true,
      childId: "child-2",
    });
    await expect(getChildDashboardTarget("user-1", db)).resolves.toEqual({
      kind: "child",
      childId: "child-2",
    });
  });

  test("users cannot switch current child to another family child", async () => {
    const db = createChildrenDatabase();

    await expect(setCurrentChild("user-1", "other-child", db)).resolves.toEqual({
      ok: false,
      error: "Child is not accessible.",
    });
  });
});
