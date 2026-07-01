import { describe, expect, test } from "vitest";
import { serializeRecordsCsv } from "@/lib/csv";

describe("CSV export helpers", () => {
  test("serializes records with UTC and local timestamps", () => {
    const csv = serializeRecordsCsv({
      timezone: "Asia/Shanghai",
      rows: [
        {
          kind: "feeding",
          recordId: "feeding-1",
          childId: "child-1",
          creatorDisplayName: "Owner",
          eventTime: new Date("2026-06-24T16:30:00.000Z"),
          startTime: new Date("2026-06-24T16:30:00.000Z"),
          endTime: new Date("2026-06-24T16:45:00.000Z"),
          feedingType: "bottle",
          amountMl: 90,
          notes: "finished, calm",
        },
      ],
    });

    expect(csv).toBe(
      [
        "kind,recordId,childId,eventTimeUtc,eventTimeLocal,startTimeUtc,endTimeUtc,creatorDisplayName,feedingType,breastSide,amountMl,diaperType,notes",
        'feeding,feeding-1,child-1,2026-06-24T16:30:00.000Z,2026-06-25 00:30,2026-06-24T16:30:00.000Z,2026-06-24T16:45:00.000Z,Owner,bottle,,90,,"finished, calm"',
      ].join("\r\n"),
    );
  });

  test("escapes quotes and preserves creator display snapshots", () => {
    const csv = serializeRecordsCsv({
      timezone: "Asia/Shanghai",
      rows: [
        {
          kind: "diaper",
          recordId: "diaper-1",
          childId: "child-1",
          creatorDisplayName: 'Caregiver "A"',
          eventTime: new Date("2026-06-25T01:00:00.000Z"),
          diaperType: "dirty",
          notes: "yellow",
        },
      ],
    });

    expect(csv).toContain('"Caregiver ""A"""');
    expect(csv).toContain("yellow");
  });
});
