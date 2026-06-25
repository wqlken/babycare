export type MilkUnit = "ml" | "oz";

const ML_PER_OUNCE = 29.5735;

export function parseMilkVolumeToMl(value: string, unit: MilkUnit) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Milk volume must be a positive number.");
  }

  if (unit === "oz") {
    return Math.round(parsed * ML_PER_OUNCE);
  }

  return Math.round(parsed);
}

export function formatMilkVolume(amountMl: number, unit: MilkUnit) {
  if (unit === "oz") {
    return `${(amountMl / ML_PER_OUNCE).toFixed(1)} oz`;
  }

  return `${Math.round(amountMl)} ml`;
}
