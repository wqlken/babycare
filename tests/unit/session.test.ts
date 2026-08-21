import { describe, expect, test } from "vitest";
import {
  encodeSessionValue,
  parseSessionValue,
  isSessionIssuedAfterRevocation,
  isSessionWithinMaxAge,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

describe("session helpers", () => {
  test("encodes and parses signed issued-at session values", () => {
    const issuedAt = new Date("2026-06-25T00:00:00.000Z");

    const value = encodeSessionValue("user-1", issuedAt, "test-secret");

    expect(value).toMatch(/^user-1:1782345600000:[a-f0-9]{64}$/);
    expect(parseSessionValue(value, "test-secret")).toEqual({
      userId: "user-1",
      issuedAt,
    });
  });

  test("rejects legacy, tampered, expired, or revoked sessions", () => {
    expect(parseSessionValue("user-1", "test-secret")).toBeNull();
    expect(parseSessionValue("user-1:1782345600000", "test-secret")).toBeNull();

    const signed = encodeSessionValue(
      "user-1",
      new Date("2026-06-25T00:00:00.000Z"),
      "test-secret",
    );
    expect(parseSessionValue(signed.replace("user-1", "user-2"), "test-secret")).toBeNull();
    expect(parseSessionValue(signed, "wrong-secret")).toBeNull();

    expect(
      isSessionWithinMaxAge(
        new Date("2026-06-25T00:00:00.000Z"),
        new Date("2026-12-22T00:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      isSessionWithinMaxAge(
        new Date("2026-06-25T00:00:00.000Z"),
        new Date("2026-12-23T00:00:01.000Z"),
      ),
    ).toBe(false);
    expect(SESSION_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 180);
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
