import { describe, expect, test } from "vitest";
import {
  buildBottleProgress,
  buildBottleTrend,
  buildSevenDaySummary,
  summarizeDay,
} from "@/lib/summaries";

describe("summary helpers", () => {
  test("summarizes feeding, diaper, and sleep totals for one local day", () => {
    const summary = summarizeDay({
      date: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [
        {
          type: "bottle",
          startTime: new Date("2026-06-25T01:00:00.000Z"),
          endTime: null,
          amountMl: 80,
        },
        {
          type: "breast",
          startTime: new Date("2026-06-25T03:00:00.000Z"),
          endTime: new Date("2026-06-25T03:20:00.000Z"),
          amountMl: null,
        },
      ],
      diapers: [
        { time: new Date("2026-06-25T02:00:00.000Z"), type: "wet" },
        { time: new Date("2026-06-25T04:00:00.000Z"), type: "dirty" },
      ],
      sleeps: [
        {
          startTime: new Date("2026-06-24T15:00:00.000Z"),
          endTime: new Date("2026-06-24T17:00:00.000Z"),
        },
      ],
    });

    expect(summary).toEqual({
      date: "2026-06-25",
      feedingCount: 2,
      bottleMl: 80,
      diaperCount: 2,
      sleepMinutes: 60,
    });
  });

  test("builds seven consecutive daily summaries", () => {
    const summaries = buildSevenDaySummary({
      endDate: "2026-06-25",
      timezone: "Asia/Shanghai",
      feedings: [],
      diapers: [],
      sleeps: [],
    });

    expect(summaries.map((summary) => summary.date)).toEqual([
      "2026-06-19",
      "2026-06-20",
      "2026-06-21",
      "2026-06-22",
      "2026-06-23",
      "2026-06-24",
      "2026-06-25",
    ]);
  });

  test("builds bottle progress capped at 100 percent", () => {
    expect(buildBottleProgress({ currentMl: 900, targetMl: 800 })).toEqual({
      currentMl: 900,
      targetMl: 800,
      percent: 100,
    });
  });

  test("builds bottle trend points scaled to the largest day", () => {
    const trend = buildBottleTrend([
      { date: "2026-06-23", feedingCount: 1, bottleMl: 120, diaperCount: 0, sleepMinutes: 0 },
      { date: "2026-06-24", feedingCount: 1, bottleMl: 240, diaperCount: 0, sleepMinutes: 0 },
      { date: "2026-06-25", feedingCount: 1, bottleMl: 60, diaperCount: 0, sleepMinutes: 0 },
    ]);

    expect(trend).toEqual([
      { date: "2026-06-23", amountMl: 120, percent: 50 },
      { date: "2026-06-24", amountMl: 240, percent: 100 },
      { date: "2026-06-25", amountMl: 60, percent: 25 },
    ]);
  });
});
