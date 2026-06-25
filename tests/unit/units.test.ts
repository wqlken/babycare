import { describe, expect, test } from "vitest";
import { formatMilkVolume, parseMilkVolumeToMl } from "@/lib/units";

describe("unit helpers", () => {
  test("stores ounce input as rounded milliliters", () => {
    expect(parseMilkVolumeToMl("2.5", "oz")).toBe(74);
  });

  test("stores milliliter input unchanged", () => {
    expect(parseMilkVolumeToMl("120", "ml")).toBe(120);
  });

  test("formats stored milliliters in the preferred unit", () => {
    expect(formatMilkVolume(90, "ml")).toBe("90 ml");
    expect(formatMilkVolume(90, "oz")).toBe("3.0 oz");
  });
});
