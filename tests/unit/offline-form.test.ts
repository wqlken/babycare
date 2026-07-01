import { describe, expect, test } from "vitest";
import {
  NETWORK_UNAVAILABLE_MESSAGE,
  shouldBlockSubmitWhenOffline,
} from "@/components/offline-form-guard";

describe("offline form guard", () => {
  test("blocks writes while the browser is offline", () => {
    expect(shouldBlockSubmitWhenOffline(false)).toEqual({
      block: true,
      message: NETWORK_UNAVAILABLE_MESSAGE,
    });
  });

  test("allows writes while online", () => {
    expect(shouldBlockSubmitWhenOffline(true)).toEqual({
      block: false,
      message: null,
    });
  });
});
