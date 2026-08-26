import { describe, expect, test } from "vitest";
import { buildDayRhythm } from "@/lib/day-rhythm";

describe("day rhythm helper", () => {
  test("maps bottle feedings and diaper records onto a local 24-hour axis", () => {
    const rhythm = buildDayRhythm({
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [
        {
          id: "feeding-1",
          type: "bottle",
          startTime: new Date("2026-06-25T06:00:00.000Z"),
          amountMl: 120,
        },
      ],
      diapers: [
        {
          id: "diaper-1",
          time: new Date("2026-06-25T08:00:00.000Z"),
          type: "dirty",
        },
      ],
      sleeps: [],
    });

    expect(rhythm.markers).toEqual([
      {
        id: "feeding-1",
        percent: 58.33,
        label: "14:00 瓶喂",
        kind: "feeding",
        value: "120 ml",
      },
      {
        id: "diaper-1",
        percent: 66.67,
        label: "16:00 便便",
        kind: "diaper",
      },
    ]);
  });

  test("formats breastfeeding markers with time ranges and duration values", () => {
    const rhythm = buildDayRhythm({
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [
        {
          id: "breast-1",
          type: "breast",
          startTime: new Date("2026-06-25T01:00:00.000Z"),
          endTime: new Date("2026-06-25T01:20:00.000Z"),
        },
        {
          id: "breast-active",
          type: "breast",
          startTime: new Date("2026-06-25T02:00:00.000Z"),
          endTime: null,
        },
      ],
      diapers: [],
      sleeps: [],
    });

    expect(rhythm.markers).toMatchObject([
      {
        id: "breast-1",
        label: "09:00-09:20 母乳",
        value: "20分钟",
      },
      {
        id: "breast-active",
        label: "10:00 开始 母乳",
        value: "进行中",
      },
    ]);
  });

  test("clips sleep segments to the selected local day", () => {
    const rhythm = buildDayRhythm({
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [],
      diapers: [],
      sleeps: [
        {
          id: "sleep-1",
          startTime: new Date("2026-06-24T15:00:00.000Z"),
          endTime: new Date("2026-06-24T18:00:00.000Z"),
        },
      ],
    });

    expect(rhythm.sleepSegments).toEqual([
      {
        id: "sleep-1",
        startPercent: 0,
        widthPercent: 8.33,
        label: "睡眠 00:00-02:00",
      },
    ]);
  });
});
