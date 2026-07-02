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
  childArchivedAt?: Date | null;
}): RecordsDatabase {
  const userId = options?.userId ?? "user-1";
  const role = options?.role ?? "owner";
  const childArchivedAt = options?.childArchivedAt ?? null;
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
    bottleContent: "formula" | "expressed_breast_milk" | "mixed" | "other" | "unknown" | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedById: string | null;
    updatedById: string | null;
  }> = [];
  const diapers: Array<{
    id: string;
    childId: string;
    creatorId: string;
    creatorDisplayName: string;
    time: Date;
    type: "wet" | "dirty" | "both";
    stoolColor: "yellow" | "brown" | "green" | "black" | "red" | "white" | "other" | "unknown" | null;
    stoolConsistency: "watery" | "loose" | "soft" | "formed" | "hard" | "mucousy" | "other" | "unknown" | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedById: string | null;
    updatedById: string | null;
  }> = [];
  const sleeps: Array<{
    id: string;
    childId: string;
    creatorId: string;
    creatorDisplayName: string;
    startTime: Date;
    endTime: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    deletedById: string | null;
    updatedById: string | null;
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
        where.id === "child-1" &&
        where.familyId === "family-1" &&
        (!("archivedAt" in where) || childArchivedAt === where.archivedAt)
          ? { id: "child-1", familyId: "family-1" }
          : null,
      ),
    },
    feedingRecord: {
      findFirst: vi.fn(async ({ where }) => {
        if ("id" in where) {
          return (
            feedings.find(
              (feeding) =>
                feeding.id === where.id &&
                (!("childId" in where) || feeding.childId === where.childId) &&
                (!("deletedAt" in where) || feeding.deletedAt === where.deletedAt),
            ) ?? null
          );
        }

        return (
          feedings.find(
            (feeding) =>
              feeding.childId === where.childId &&
              feeding.type === where.type &&
              feeding.endTime === where.endTime &&
              (!("deletedAt" in where) || feeding.deletedAt === where.deletedAt),
          ) ?? null
        );
      }),
      create: vi.fn(async ({ data }) => {
        const now = new Date("2026-06-25T01:00:00.000Z");
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
          bottleContent: data.bottleContent ?? null,
          notes: data.notes ?? null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deletedById: null,
          updatedById: null,
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
        feeding.deletedAt = "deletedAt" in data ? data.deletedAt : feeding.deletedAt;
        feeding.deletedById =
          "deletedById" in data ? data.deletedById : feeding.deletedById;
        feeding.updatedById =
          "updatedById" in data ? data.updatedById : feeding.updatedById;
        feeding.updatedAt = new Date(feeding.updatedAt.getTime() + 1);
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
      create: vi.fn(async ({ data }) => {
        const now = new Date("2026-06-25T01:00:00.000Z");
        const diaper = {
          id: `diaper-${diapers.length + 1}`,
          childId: data.childId,
          creatorId: data.creatorId,
          creatorDisplayName: data.creatorDisplayName,
          time: data.time,
          type: data.type,
          stoolColor: data.stoolColor ?? null,
          stoolConsistency: data.stoolConsistency ?? null,
          notes: data.notes ?? null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deletedById: null,
          updatedById: null,
        };
        diapers.push(diaper);
        return diaper;
      }),
      findFirst: vi.fn(async ({ where }) => {
        return (
          diapers.find(
            (diaper) =>
              diaper.id === where.id &&
              (!("childId" in where) || diaper.childId === where.childId) &&
              (!("deletedAt" in where) || diaper.deletedAt === where.deletedAt),
          ) ?? null
        );
      }),
      update: vi.fn(async ({ where, data }) => {
        const diaper = diapers.find((item) => item.id === where.id);
        if (!diaper) throw new Error("Diaper not found.");
        diaper.notes = "notes" in data ? data.notes : diaper.notes;
        diaper.deletedAt = "deletedAt" in data ? data.deletedAt : diaper.deletedAt;
        diaper.deletedById =
          "deletedById" in data ? data.deletedById : diaper.deletedById;
        diaper.updatedById =
          "updatedById" in data ? data.updatedById : diaper.updatedById;
        return diaper;
      }),
      delete: vi.fn(async ({ where }) => {
        const index = diapers.findIndex((item) => item.id === where.id);
        if (index === -1) throw new Error("Diaper not found.");
        const [record] = diapers.splice(index, 1);
        return record;
      }),
    },
    sleepRecord: {
      findFirst: vi.fn(async ({ where }) => {
        if ("id" in where) {
          return (
            sleeps.find(
              (sleep) =>
                sleep.id === where.id &&
                (!("childId" in where) || sleep.childId === where.childId) &&
                (!("deletedAt" in where) || sleep.deletedAt === where.deletedAt),
            ) ?? null
          );
        }

        return (
          sleeps.find(
            (sleep) =>
              sleep.childId === where.childId &&
              sleep.endTime === where.endTime &&
              (!("deletedAt" in where) || sleep.deletedAt === where.deletedAt),
          ) ?? null
        );
      }),
      create: vi.fn(async ({ data }) => {
        const now = new Date("2026-06-25T01:00:00.000Z");
        const sleep = {
          id: `sleep-${sleeps.length + 1}`,
          childId: data.childId,
          creatorId: data.creatorId,
          creatorDisplayName: data.creatorDisplayName,
          startTime: data.startTime,
          endTime: data.endTime ?? null,
          notes: data.notes ?? null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
          deletedById: null,
          updatedById: null,
        };
        sleeps.push(sleep);
        return sleep;
      }),
      update: vi.fn(async ({ where, data }) => {
        const sleep = sleeps.find((item) => item.id === where.id);
        if (!sleep) throw new Error("Sleep not found.");
        sleep.endTime = data.endTime ?? sleep.endTime;
        sleep.notes = "notes" in data ? data.notes : sleep.notes;
        sleep.deletedAt = "deletedAt" in data ? data.deletedAt : sleep.deletedAt;
        sleep.deletedById = "deletedById" in data ? data.deletedById : sleep.deletedById;
        sleep.updatedById = "updatedById" in data ? data.updatedById : sleep.updatedById;
        sleep.updatedAt = new Date(sleep.updatedAt.getTime() + 1);
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

  test("creates a bottle feeding with content details", async () => {
    const db = createRecordsDatabase();

    const result = await createBottleFeeding(
      "user-1",
      {
        childId: "child-1",
        amountMl: 120,
        bottleContent: "expressed_breast_milk",
        eventTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "feeding-1" });
    expect(db.feedingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bottleContent: "expressed_breast_milk",
      }),
    });
  });

  test("stores creator display name as a snapshot when creating records", async () => {
    const db = createRecordsDatabase({
      userId: "caregiver-1",
      role: "caregiver",
    });

    const result = await createBottleFeeding(
      "caregiver-1",
      {
        childId: "child-1",
        amountMl: 90,
        eventTime: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "feeding-1" });
    expect(db.feedingRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        creatorDisplayName: "Caregiver",
      }),
    });
  });

  test("prevents normal record creation for archived children", async () => {
    const db = createRecordsDatabase({
      childArchivedAt: new Date("2026-06-25T00:00:00.000Z"),
    });

    await expect(
      createBottleFeeding(
        "user-1",
        {
          childId: "child-1",
          amountMl: 90,
          eventTime: new Date("2026-06-25T01:00:00.000Z"),
        },
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Child is not accessible.",
    });
    expect(db.feedingRecord.create).not.toHaveBeenCalled();
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

  test("creates a dirty diaper record with stool details", async () => {
    const db = createRecordsDatabase();

    const result = await createDiaper(
      "user-1",
      {
        childId: "child-1",
        type: "dirty",
        stoolColor: "yellow",
        stoolConsistency: "soft",
        time: new Date("2026-06-25T01:00:00.000Z"),
      },
      db,
    );

    expect(result).toEqual({ ok: true, recordId: "diaper-1" });
    expect(db.diaperRecord.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stoolColor: "yellow",
        stoolConsistency: "soft",
      }),
    });
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
          updatedAt: new Date("2026-06-25T01:00:00.000Z"),
        } as Parameters<typeof updateBottleFeeding>[1],
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
          updatedAt: new Date("2026-06-25T01:00:00.000Z"),
        } as Parameters<typeof updateBottleFeeding>[1],
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Only owners or record creators can edit records.",
    });
  });

  test("rejects bottle edits when the record version is stale", async () => {
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
      updateBottleFeeding(
        "user-1",
        {
          childId: "child-1",
          recordId: "feeding-1",
          amountMl: 120,
          updatedAt: new Date("2026-06-25T00:59:59.999Z"),
        } as Parameters<typeof updateBottleFeeding>[1],
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Record has changed. Refresh and try again.",
    });
    expect(db.feedingRecord.update).not.toHaveBeenCalled();
  });

  test("owners soft-delete records instead of hard deleting them", async () => {
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

    expect(db.feedingRecord.update).toHaveBeenCalledWith({
      where: { id: "feeding-1" },
      data: expect.objectContaining({
        deletedAt: expect.any(Date),
        deletedById: "user-1",
      }),
    });
    expect(db.feedingRecord.delete).not.toHaveBeenCalled();
  });

  test("deleted records cannot be edited again", async () => {
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

    await deleteRecord(
      "user-1",
      {
        childId: "child-1",
        kind: "feeding",
        recordId: "feeding-1",
      },
      db,
    );

    await expect(
      updateBottleFeeding(
        "user-1",
        {
          childId: "child-1",
          recordId: "feeding-1",
          amountMl: 120,
          updatedAt: new Date("2026-06-25T01:00:00.000Z"),
        } as Parameters<typeof updateBottleFeeding>[1],
        db,
      ),
    ).resolves.toEqual({
      ok: false,
      error: "Record is not accessible.",
    });
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
