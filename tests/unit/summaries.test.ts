import { describe, expect, test } from "vitest";
import { buildSevenDaySummary, summarizeDay } from "@/lib/summaries";

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
});
