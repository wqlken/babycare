import { describe, expect, test } from "vitest";
import {
  encodeSessionValue,
  parseSessionValue,
  isSessionIssuedAfterRevocation,
} from "@/lib/auth/session";

describe("session helpers", () => {
  test("encodes and parses issued-at session values", () => {
    const issuedAt = new Date("2026-06-25T00:00:00.000Z");

    const value = encodeSessionValue("user-1", issuedAt);

    expect(value).toBe("user-1:1782345600000");
    expect(parseSessionValue(value)).toEqual({
      userId: "user-1",
      issuedAt,
    });
  });

  test("rejects legacy or revoked sessions", () => {
    expect(parseSessionValue("user-1")).toBeNull();
    expect(
      isSessionIssuedAfterRevocation(
        new Date("2026-06-25T00:00:00.000Z"),
        new Date("2026-06-25T00:00:01.000Z"),
      ),
    ).toBe(false);
    expect(
      isSessionIssuedAfterRevocation(
        new Date("2026-06-25T00:00:02.000Z"),
        new Date("2026-06-25T00:00:01.000Z"),
      ),
    ).toBe(true);
  });
});
