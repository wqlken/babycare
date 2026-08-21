import { describe, expect, test } from "vitest";
import { formatElapsedDuration } from "@/components/dashboard/active-timers";

describe("active timer formatting", () => {
  test("does not round active timer duration upward", () => {
    const startTime = new Date("2026-06-25T01:00:00.000Z");

    expect(
      formatElapsedDuration(
        startTime,
        new Date("2026-06-25T01:00:30.000Z"),
      ),
    ).toBe("不足1分钟");
    expect(
      formatElapsedDuration(
        startTime,
        new Date("2026-06-25T01:01:59.000Z"),
      ),
    ).toBe("1分钟");
    expect(
      formatElapsedDuration(
        startTime,
        new Date("2026-06-25T02:05:00.000Z"),
      ),
    ).toBe("1小时5分钟");
  });
});
