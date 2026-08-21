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

  test("formats breastfeeding titles with Chinese side labels", () => {
    const items = buildTimelineItems({
      feedings: [
        {
          id: "breast-left",
          type: "breast",
          breastSide: "left",
          startTime: new Date("2026-06-25T01:00:00.000Z"),
          endTime: new Date("2026-06-25T01:20:00.000Z"),
          amountMl: null,
          creatorDisplayName: "Owner",
          notes: null,
        },
        {
          id: "breast-unknown",
          type: "breast",
          breastSide: "unknown",
          startTime: new Date("2026-06-25T02:00:00.000Z"),
          endTime: new Date("2026-06-25T02:10:00.000Z"),
          amountMl: null,
          creatorDisplayName: "Owner",
          notes: null,
        },
      ],
      diapers: [],
      sleeps: [],
    });

    expect(items.map((item) => item.title)).toEqual(["母乳", "母乳 左侧"]);
  });

  test("keeps feeding sort time separate from display time", () => {
    const breastStartTime = new Date("2026-06-25T01:00:00.000Z");
    const breastEndTime = new Date("2026-06-25T01:20:00.000Z");
    const bottleTime = new Date("2026-06-25T02:00:00.000Z");

    const items = buildTimelineItems({
      feedings: [
        {
          id: "breast",
          type: "breast",
          breastSide: "left",
          startTime: breastStartTime,
          endTime: breastEndTime,
          amountMl: null,
          creatorDisplayName: "Owner",
          notes: null,
        },
        {
          id: "bottle",
          type: "bottle",
          breastSide: null,
          startTime: bottleTime,
          endTime: null,
          amountMl: 90,
          creatorDisplayName: "Owner",
          notes: null,
        },
      ],
      diapers: [],
      sleeps: [],
    });

    const breast = items.find((item) => item.id === "breast");
    const bottle = items.find((item) => item.id === "bottle");

    expect(breast).toMatchObject({
      feedingType: "breast",
      time: breastEndTime,
      displayStartTime: breastStartTime,
      displayEndTime: breastEndTime,
    });
    expect(bottle).toMatchObject({
      feedingType: "bottle",
      time: bottleTime,
      displayStartTime: bottleTime,
    });
    expect(bottle?.displayEndTime).toBeUndefined();
  });
});
