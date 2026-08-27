import type { BottleContent, StoolColor, StoolConsistency } from "@/lib/records/types";

const bottleContents = new Set<string>([
  "formula",
  "expressed_breast_milk",
  "mixed",
  "other",
  "unknown",
]);

const stoolColors = new Set<string>([
  "yellow",
  "brown",
  "green",
  "black",
  "red",
  "white",
  "other",
  "unknown",
]);

const stoolConsistencies = new Set<string>([
  "watery",
  "loose",
  "soft",
  "formed",
  "hard",
  "mucousy",
  "other",
  "unknown",
]);

const breastSides = new Set<string>(["left", "right", "both", "unknown"]);

const diaperTypes = new Set<string>(["wet", "dirty", "both"]);

export function cleanNotes(notes?: string | null) {
  const trimmed = notes?.trim();
  return trimmed ? trimmed : null;
}

export function cleanBottleContent(value?: string | null): BottleContent {
  return bottleContents.has(value ?? "") ? (value as BottleContent) : "unknown";
}

export function cleanBreastSide(value?: string | null) {
  return breastSides.has(value ?? "")
    ? (value as "left" | "right" | "both" | "unknown")
    : "unknown";
}

export function cleanDiaperType(value?: string | null) {
  return diaperTypes.has(value ?? "")
    ? (value as "wet" | "dirty" | "both")
    : "wet";
}

export function cleanStoolColor(value?: string | null): StoolColor | null {
  if (!value) return null;
  return stoolColors.has(value) ? (value as StoolColor) : "unknown";
}

export function cleanStoolConsistency(
  value?: string | null,
): StoolConsistency | null {
  if (!value) return null;
  return stoolConsistencies.has(value) ? (value as StoolConsistency) : "unknown";
}

export function isInvalidBottleAmount(amountMl?: number | null) {
  return !Number.isInteger(amountMl) || (amountMl ?? 0) <= 0;
}
