import { describe, expect, test } from "vitest";
import {
  normalizeThemeChoice,
  resolveThemeChoice,
  themeChoices,
} from "@/lib/theme-preference";

describe("theme preference", () => {
  test("defaults to system when stored preference is absent or invalid", () => {
    expect(normalizeThemeChoice(null)).toBe("system");
    expect(normalizeThemeChoice("")).toBe("system");
    expect(normalizeThemeChoice("unexpected")).toBe("system");
  });

  test("keeps explicit user theme choices including system", () => {
    expect(themeChoices).toEqual(["light", "dark", "system"]);
    expect(normalizeThemeChoice("light")).toBe("light");
    expect(normalizeThemeChoice("dark")).toBe("dark");
    expect(normalizeThemeChoice("system")).toBe("system");
  });

  test("resolves system choice from the current system color scheme", () => {
    expect(resolveThemeChoice("light", true)).toBe("light");
    expect(resolveThemeChoice("dark", false)).toBe("dark");
    expect(resolveThemeChoice("system", true)).toBe("dark");
    expect(resolveThemeChoice("system", false)).toBe("light");
  });
});
