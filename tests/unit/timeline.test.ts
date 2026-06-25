import { describe, expect, test } from "vitest";
import { buildTimelineItems } from "@/lib/timeline";

describe("timeline helpers", () => {
  test("combines records in reverse chronological order", () => {
    const items = buildTimelineItems({
      feedings: [
        {
          id: "feeding-1",
          type: "bottle",
          breastSide: null,
          startTime: new Date("2026-06-25T01:00:00.000Z"),
          endTime: new Date("2026-06-25T01:00:00.000Z"),
          amountMl: 90,
          creatorDisplayName: "Owner",
          notes: null,
        },
      ],
      diapers: [
        {
          id: "diaper-1",
          type: "wet",
          time: new Date("2026-06-25T03:00:00.000Z"),
          creatorDisplayName: "Owner",
          notes: "normal",
        },
      ],
      sleeps: [
        {
          id: "sleep-1",
          startTime: new Date("2026-06-25T02:00:00.000Z"),
          endTime: null,
          creatorDisplayName: "Owner",
          notes: null,
        },
      ],
    });

    expect(items.map((item) => item.id)).toEqual([
      "diaper-1",
      "sleep-1",
      "feeding-1",
    ]);
    expect(items[0]).toMatchObject({
      kind: "diaper",
      title: "尿湿",
      creatorDisplayName: "Owner",
      notes: "normal",
    });
  });
});
