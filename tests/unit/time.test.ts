import { describe, expect, test } from "vitest";
import {
  formatChildAge,
  getLocalDayRange,
  splitDurationByLocalDay,
} from "@/lib/time";

describe("time helpers", () => {
  test("returns Asia/Shanghai local day boundaries as UTC instants", () => {
    const range = getLocalDayRange("2026-06-25", "Asia/Shanghai");

    expect(range.start.toISOString()).toBe("2026-06-24T16:00:00.000Z");
    expect(range.end.toISOString()).toBe("2026-06-25T16:00:00.000Z");
  });

  test("splits cross-midnight sleep duration by local day", () => {
    const split = splitDurationByLocalDay({
      start: new Date("2026-06-24T15:00:00.000Z"),
      end: new Date("2026-06-24T17:00:00.000Z"),
      timezone: "Asia/Shanghai",
    });

    expect(split).toEqual([
      { date: "2026-06-24", minutes: 60 },
      { date: "2026-06-25", minutes: 60 },
    ]);
  });

  test("formats child age by days first, then months", () => {
    expect(
      formatChildAge({
        birthday: new Date("2026-06-01T00:00:00.000Z"),
        now: new Date("2026-06-25T00:00:00.000Z"),
      }),
    ).toBe("24天");

    expect(
      formatChildAge({
        birthday: new Date("2026-01-01T00:00:00.000Z"),
        now: new Date("2026-06-25T00:00:00.000Z"),
      }),
    ).toBe("5个月");
  });
});
