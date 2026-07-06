import { describe, expect, test } from "vitest";
import {
  formatDateTimeLocalInput,
  formatChildAge,
  getLocalDayRange,
  parseRecordDateTimeInput,
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

  test("parses record datetime-local input in the family timezone", () => {
    const parsed = parseRecordDateTimeInput("2026-06-25T08:30", {
      timezone: "Asia/Shanghai",
      now: new Date("2026-06-25T00:35:00.000Z"),
    });

    expect(parsed.toISOString()).toBe("2026-06-25T00:30:00.000Z");
  });

  test("formats record time for datetime-local inputs", () => {
    expect(
      formatDateTimeLocalInput(
        new Date("2026-06-25T00:30:00.000Z"),
        "Asia/Shanghai",
      ),
    ).toBe("2026-06-25T08:30");
  });

  test("rejects record times too far in the future", () => {
    expect(() =>
      parseRecordDateTimeInput("2026-06-25T08:41", {
        timezone: "Asia/Shanghai",
        now: new Date("2026-06-25T00:35:00.000Z"),
      }),
    ).toThrow("记录时间不能晚于当前时间。");
  });

  test("rejects invalid calendar dates from record time input", () => {
    expect(() =>
      parseRecordDateTimeInput("2026-02-31T08:30", {
        timezone: "Asia/Shanghai",
        now: new Date("2026-06-25T00:35:00.000Z"),
      }),
    ).toThrow("记录时间无效。");
  });
});
