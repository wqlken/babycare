import { describe, expect, test, vi } from "vitest";
import {
  archiveChild,
  createChild,
  getChildDashboardTarget,
  setCurrentChild,
  unarchiveChild,
  updateChild,
  type ChildrenDatabase,
} from "@/lib/children/service";

function createChildrenDatabase(role: "owner" | "caregiver" = "owner"): ChildrenDatabase {
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
        role,
        removedAt: null,
      })),
    },
    child: {
      findMany: vi.fn(async ({ where }) =>
        children.filter(
          (child) =>
            child.familyId === where.familyId && child.archivedAt === where.archivedAt,
        ),
      ),
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
      findFirst: vi.fn(async ({ where }) => {
        return (
          children.find(
            (child) =>
              child.id === where.id &&
              child.familyId === where.familyId &&
              (!("archivedAt" in where) || child.archivedAt === where.archivedAt),
          ) ?? null
        );
      }),
      update: vi.fn(async ({ where, data }) => {
        const child = children.find((item) => item.id === where.id);
        if (!child) throw new Error("Child not found.");
        child.name = data.name ?? child.name;
        child.birthday = data.birthday ?? child.birthday;
        child.gender = data.gender ?? child.gender;
        child.notes = data.notes ?? child.notes;
        child.archivedAt =
          "archivedAt" in data ? data.archivedAt ?? null : child.archivedAt;
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

  test("caregivers cannot create children", async () => {
    const db = createChildrenDatabase("caregiver");

    await expect(
      createChild(
        "caregiver-1",
        {
          name: "宝宝",
          birthday: "2026-01-01",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners can manage children.",
    });
  });

  test("owners can update accessible child profile", async () => {
    const db = createChildrenDatabase("owner");

    await createChild(
      "owner-1",
      {
        name: "宝宝",
        birthday: "2026-01-01",
      },
      db,
    );

    await expect(
      updateChild(
        "owner-1",
        "child-1",
        {
          name: "小宝",
          birthday: "2026-02-01",
          gender: "female",
          notes: "爱睡觉",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, childId: "child-1" });
  });

  test("caregivers cannot update child profile", async () => {
    const db = createChildrenDatabase("caregiver");

    await expect(
      updateChild(
        "caregiver-1",
        "child-1",
        {
          name: "小宝",
          birthday: "2026-02-01",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners can manage children.",
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

  test("owners can archive and restore a child", async () => {
    const db = createChildrenDatabase();

    await createChild(
      "owner-1",
      {
        name: "宝宝",
        birthday: "2026-01-01",
      },
      db,
    );

    await expect(archiveChild("owner-1", "child-1", db)).resolves.toEqual({
      ok: true,
      childId: "child-1",
    });
    await expect(getChildDashboardTarget("owner-1", db)).resolves.toEqual({
      kind: "needs-child",
      href: "/children",
    });
    await expect(unarchiveChild("owner-1", "child-1", db)).resolves.toEqual({
      ok: true,
      childId: "child-1",
    });
    await expect(getChildDashboardTarget("owner-1", db)).resolves.toEqual({
      kind: "child",
      childId: "child-1",
    });
  });

  test("caregivers cannot archive children", async () => {
    const db = createChildrenDatabase("caregiver");

    await expect(archiveChild("caregiver-1", "child-1", db)).resolves.toEqual({
      ok: false,
      error: "Only owners can manage children.",
    });
  });
});
