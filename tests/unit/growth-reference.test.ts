import { describe, expect, test } from "vitest";
import {
  buildGrowthReferenceLines,
  getAgeDays,
  getGrowthAssessment,
  getReferenceMaxAgeDays,
  getZScore,
  normalizeGrowthSex,
} from "@/lib/growth/reference";

describe("growth reference helpers", () => {
  test("calculates age in local days", () => {
    expect(
      getAgeDays({
        birthday: new Date("2026-06-01T00:00:00.000Z"),
        measuredAt: new Date("2026-06-30T10:00:00.000Z"),
      }),
    ).toBe(29);
  });

  test("normalizes supported child sex values", () => {
    expect(normalizeGrowthSex("female")).toBe("female");
    expect(normalizeGrowthSex("male")).toBe("male");
    expect(normalizeGrowthSex(null)).toBeNull();
    expect(normalizeGrowthSex("")).toBeNull();
  });

  test("returns near-zero z-score for the median reference value", () => {
    const zScore = getZScore({
      sex: "female",
      metric: "weightForAge",
      ageDays: 0,
      value: 3.2322,
    });

    expect(zScore).not.toBeNull();
    expect(zScore ?? 0).toBeCloseTo(0, 3);
  });

  test("describes values outside the reference range cautiously", () => {
    const assessment = getGrowthAssessment({
      sex: "male",
      metric: "lengthForAge",
      ageDays: 30,
      value: 45,
    });

    expect(assessment?.tone).toBe("alert");
    expect(assessment?.label).toContain("儿保医生");
  });

  test("builds 0-36 month reference lines", () => {
    const lines = buildGrowthReferenceLines({
      sex: "female",
      metric: "weightForAge",
      maxAgeDays: getReferenceMaxAgeDays(2000),
    });

    expect(lines).toHaveLength(3);
    expect(lines[0].points[0]).toMatchObject({ ageDays: 0, month: 0 });
    expect(lines[0].points.at(-1)).toMatchObject({
      ageDays: 1096,
      month: 36,
    });
  });

  test("does not assess when sex or age range is unsupported", () => {
    expect(
      getGrowthAssessment({
        sex: null,
        metric: "weightForAge",
        ageDays: 30,
        value: 4.2,
      }),
    ).toBeNull();
    expect(
      getGrowthAssessment({
        sex: "female",
        metric: "weightForAge",
        ageDays: 1200,
        value: 14,
      }),
    ).toBeNull();
  });
});
