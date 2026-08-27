import type { GrowthRecordItem } from "@/lib/growth/service";
import {
  formatGrowthBmi,
  formatGrowthMeasurement,
} from "@/lib/growth/view-model";

type GrowthSummaryCardsProps = {
  latestBmiRecord: GrowthRecordItem | null;
  latestLength: GrowthRecordItem | null;
  latestWeight: GrowthRecordItem | null;
  recordCount: number;
};

export function GrowthSummaryCards({
  latestBmiRecord,
  latestLength,
  latestWeight,
  recordCount,
}: GrowthSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <div className="bc-card p-4">
        <p className="text-sm text-[var(--text-muted)]">最新体重</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          {formatGrowthMeasurement(latestWeight, "kg")}
        </p>
      </div>
      <div className="bc-card p-4">
        <p className="text-sm text-[var(--text-muted)]">最新身长/身高</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          {formatGrowthMeasurement(latestLength, "cm")}
        </p>
      </div>
      <div className="bc-card p-4">
        <p className="text-sm text-[var(--text-muted)]">记录次数</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          {recordCount} 次
        </p>
      </div>
      <div className="bc-card p-4">
        <p className="text-sm text-[var(--text-muted)]">最新 BMI</p>
        <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          {formatGrowthBmi(latestBmiRecord)}
        </p>
      </div>
    </div>
  );
}
