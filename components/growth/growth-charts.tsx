import { GrowthChart } from "@/components/growth/growth-chart";
import type { GrowthReferenceLine } from "@/components/growth/growth-chart";

type GrowthChartPoint = {
  id: string;
  label: string;
  ageDays: number;
  value: number | null;
};

type GrowthChartsProps = {
  lengthChart: {
    points: GrowthChartPoint[];
    referenceLines: GrowthReferenceLine[];
  };
  maxAgeDays: number;
  weightChart: {
    points: GrowthChartPoint[];
    referenceLines: GrowthReferenceLine[];
  };
};

export function GrowthCharts({
  lengthChart,
  maxAgeDays,
  weightChart,
}: GrowthChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GrowthChart
        emptyText="保存体重后会生成趋势曲线。"
        maxAgeDays={maxAgeDays}
        points={weightChart.points}
        referenceLines={weightChart.referenceLines}
        title="体重曲线"
        unit="kg"
      />
      <GrowthChart
        emptyText="保存身长/身高后会生成趋势曲线。"
        maxAgeDays={maxAgeDays}
        points={lengthChart.points}
        referenceLines={lengthChart.referenceLines}
        title="身长/身高曲线"
        unit="cm"
      />
    </div>
  );
}
