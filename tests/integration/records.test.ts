import { describe, expect, test, vi } from "vitest";
import {
  createBottleFeeding,
  createDiaper,
  deleteRecord,
  updateBottleFeeding,
  startBreastfeeding,
  startSleep,
  stopBreastfeeding,
  stopSleep,
  type RecordsDatabase,
} from "@/lib/records/service";

function createRecordsDatabase(options?: {
  userId?: string;
  role?: "owner" | "caregiver";
}): RecordsDatabase {
  const userId = options?.userId ?? "user-1";
  const role = options?.role ?? "owner";
  const feedings: Array<{
    id: string;
    childId: string;
    creatorId: string;
    creatorDisplayName: string;
    type: "breast" | "bottle";
    breastSide: "left" | "right" | "both" | "unknown" | null;
    startTime: Date;
    endTime: Date | null;
    amountMl: number | null;
    notes: string | null;
  }> = [];
  const sleeps: Array<{
    id: string;
    childId: string;
    creatorId: string;
    creatorDisplayName: string;
    startTime: Date;
    endTime: Date | null;
    notes: string | null;
  }> = [];

  return {
    user: {
      findUnique: vi.fn(async () => ({
        id: userId,
        displayName: role === "owner" ? "Owner" : "Caregiver",
      })),
    },
    familyMember: {
      findFirst: vi.fn(async () => ({
        familyId: "family-1",
        role,
        removedAt: null,
      })),
    },
    child: {
      findFirst: vi.fn(async ({ where }) =>
        where.id === "child-1" && where.familyId === "family-1"
          ? { id: "child-1", familyId: "family-1" }
          : null,
      ),
    },
    feedingRecord: {
      findFirst: vi.fn(async ({ where }) => {
        if ("id" in where) {
          return feedings.find((feeding) => feeding.id === where.id) ?? null;
        }

        return (
          feedings.find(
            (feeding) =>
              feeding.childId === where.childId &&
              feeding.type === where.type &&
              feeding.endTime === where.endTime,
          ) ?? null
        );
      }),
      create: vi.fn(async ({ data }) => {
        const feeding = {
          id: `feeding-${feedings.length + 1}`,
          childId: data.childId,
          creatorId: data.creatorId,
          creatorDisplayName: data.creatorDisplayName,
          type: data.type,
          breastSide: data.breastSide ?? null,
          startTime: data.startTime,
          endTime: data.endTime ?? null,
          amountMl: data.amountMl ?? null,
          notes: data.notes ?? null,
        };
        feedings.push(feeding);
        return feeding;
      }),
      update: vi.fn(async ({ where, data }) => {
        const feeding = feedings.find((item) => item.id === where.id);
        if (!feeding) throw new Error("Feeding not found.");
        feeding.endTime = data.endTime ?? feeding.endTime;
        feeding.amountMl = data.amountMl ?? feeding.amountMl;
        feeding.notes = "notes" in data ? data.notes : feeding.notes;
        return feeding;
      }),
      delete: vi.fn(async ({ where }) => {
        const index = feedings.findIndex((item) => item.id === where.id);
        if (index === -1) throw new Error("Feeding not found.");
        const [record] = feedings.splice(index, 1);
        return record;
      }),
    },
    diaperRecord: {
      create: vi.fn(async ({ data }) => ({
        id: "diaper-1",
        ...data,
      })),
      findFirst: vi.fn(async () => null),
      update: vi.fn(async () => ({ id: "diaper-1" })),
      delete: vi.fn(async () => ({ id: "diaper-1" })),
    },
    sleepRecord: {
      findFirst: vi.fn(async ({ where }) => {
        if ("id" in where) {
          return sleeps.find((sleep) => sleep.id === where.id) ?? null;
        }

        return (
          sleeps.find(
            (sleep) =>
              sleep.childId === where.childId && sleep.endTime === where.endTime,
          ) ?? null
        );
      }),
      create: vi.fn(async ({ data }) => {
        const sleep = {
          id: `sleep-${sleeps.length + 1}`,
          childId: data.childId,
          creatorId: data.creatorId,
          creatorDisplayName: data.creatorDisplayName,
          startTime: data.startTime,
          endTime: data.endTime ?? null,
          notes: data.notes ?? null,
        };
        sleeps.push(sleep);
        return sleep;
      }),
      update: vi.fn(async ({ where, data }) => {
        const sleep = sleeps.find((item) => item.id === where.id);
        if (!sleep) throw new Error("Sleep not found.");
        sleep.endTime = data.endTime ?? sleep.endTime;
        sleep.notes = "notes" in data ? data.notes : sleep.notes;
        return sleep;
      }),
      delete: vi.fn(async ({ where }) => {
        const index = sleeps.findIndex((item) => item.id === where.id);
        if (index === -1) throw new Error("Sleep not found.");
        const [record] = sleeps.splice(index, 1);
        return record;
      }),
    },
  };
}

describe("record creation", () => {
  test("creates a bottle feeding with milliliters", async () => {
    const db = createRecordsDatabase();

    const result = await createBottleFeeding(
      "user-1",
      {
        childId: "child-1",
        amountMl: 90,
        eventTime: new Date("2026-06-25T01:00:00.000Z"),
        notes: "finished",
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "feeding-1" });
    expect(db.feedingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        childId: "child-1",
        creatorDisplayName: "Owner",
        type: "bottle",
        amountMl: 90,
      }),
    });
  });

  test("prevents a second active breastfeeding record for one child", async () => {
    const db = createRecordsDatabase();

    await startBreastfeeding(
      "user-1",
      {
        childId: "child-1",
        breastSide: "left",
        startTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    await expect(
      startBreastfeeding(
        "user-1",
        {
          childId: "child-1",
          breastSide: "right",
          startTime: new Date("2026-06-25T02:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "An active breastfeeding record already exists.",
    });
  });

  test("stops the active breastfeeding record for one child", async () => {
    const db = createRecordsDatabase();

    await startBreastfeeding(
      "user-1",
      {
        childId: "child-1",
        breastSide: "left",
        startTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    await expect(
      stopBreastfeeding(
        "user-1",
        {
          childId: "child-1",
          endTime: new Date("2026-06-25T01:20:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, recordId: "feeding-1" });
  });

  test("creates a diaper record", async () => {
    const db = createRecordsDatabase();

    const result = await createDiaper(
      "user-1",
      {
        childId: "child-1",
        type: "both",
        time: new Date("2026-06-25T01:00:00.000Z"),
        notes: "normal",
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "diaper-1" });
  });

  test("prevents a second active sleep record for one child", async () => {
    const db = createRecordsDatabase();

    await startSleep(
      "user-1",
      {
        childId: "child-1",
        startTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    await expect(
      startSleep(
        "user-1",
        {
          childId: "child-1",
          startTime: new Date("2026-06-25T02:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "An active sleep record already exists.",
    });
  });

  test("stops the active sleep record for one child", async () => {
    const db = createRecordsDatabase();

    await startSleep(
      "user-1",
      {
        childId: "child-1",
        startTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    await expect(
      stopSleep(
        "user-1",
        {
          childId: "child-1",
          endTime: new Date("2026-06-25T02:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, recordId: "sleep-1" });
  });

  test("caregivers can edit records they created", async () => {
    const db = createRecordsDatabase({
      userId: "caregiver-1",
      role: "caregiver",
    });

    await createBottleFeeding(
      "caregiver-1",
      {
        childId: "child-1",
        amountMl: 90,
        eventTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    await expect(
      updateBottleFeeding(
        "caregiver-1",
        {
          childId: "child-1",
          recordId: "feeding-1",
          amountMl: 120,
          notes: "more",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true, recordId: "feeding-1" });
  });

  test("caregivers cannot edit records created by others", async () => {
    const db = createRecordsDatabase({
      userId: "owner-1",
      role: "owner",
    });

    await createBottleFeeding(
      "owner-1",
      {
        childId: "child-1",
        amountMl: 90,
        eventTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    db.user.findUnique = vi.fn(async () => ({
      id: "caregiver-1",
      displayName: "Caregiver",
    }));
    db.familyMember.findFirst = vi.fn(async () => ({
      familyId: "family-1",
      role: "caregiver" as const,
      removedAt: null,
    }));

    await expect(
      updateBottleFeeding(
        "caregiver-1",
        {
          childId: "child-1",
          recordId: "feeding-1",
          amountMl: 120,
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners or record creators can edit records.",
    });
  });

  test("owners can delete records", async () => {
    const db = createRecordsDatabase();

    await createBottleFeeding(
      "user-1",
      {
        childId: "child-1",
        amountMl: 90,
        eventTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    await expect(
      deleteRecord(
        "user-1",
        {
          childId: "child-1",
          kind: "feeding",
          recordId: "feeding-1",
        },
        db,
      ),
    ).resolves.toEqual({ ok: true });
  });

  test("caregivers cannot delete records", async () => {
    const db = createRecordsDatabase({
      userId: "caregiver-1",
      role: "caregiver",
    });

    await expect(
      deleteRecord(
        "caregiver-1",
        {
          childId: "child-1",
          kind: "feeding",
          recordId: "feeding-1",
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners can delete records.",
    });
  });
});
