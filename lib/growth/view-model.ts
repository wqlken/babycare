import {
  buildGrowthReferenceLines,
  getAgeDays,
  getGrowthAssessment,
  getReferenceMaxAgeDays,
  normalizeGrowthSex,
} from "@/lib/growth/reference";
import type { GrowthRecordItem } from "@/lib/growth/service";

const chartDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
});

export type GrowthChildView = {
  id: string;
  name: string;
  birthday: Date;
  gender: string | null;
};

export type GrowthChartMetric = "weightKg" | "lengthCm";

export function formatGrowthDecimal(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

export function formatGrowthMeasurement(
  record: GrowthRecordItem | null,
  unit: string,
) {
  if (!record) return "暂无";

  const value = unit === "kg" ? record.weightKg : record.lengthCm;
  return value === null ? "暂无" : `${formatGrowthDecimal(value)}${unit}`;
}

export function buildGrowthChartPoints(input: {
  birthday: Date;
  key: GrowthChartMetric;
  records: GrowthRecordItem[];
}) {
  return input.records.map((record) => ({
    id: `${input.key}-${record.id}`,
    label: chartDateFormatter.format(record.measuredAt),
    ageDays: getAgeDays({
      birthday: input.birthday,
      measuredAt: record.measuredAt,
    }),
    value: record[input.key],
  }));
}

export function formatGrowthRecordSummary(record: GrowthRecordItem) {
  const parts = [];

  if (record.weightKg !== null) {
    parts.push(`体重 ${formatGrowthDecimal(record.weightKg)}kg`);
  }

  if (record.lengthCm !== null) {
    parts.push(`身长/身高 ${formatGrowthDecimal(record.lengthCm)}cm`);
  }

  return parts.join(" · ");
}

export function formatGrowthBmi(record: GrowthRecordItem | null) {
  if (!record?.weightKg || !record.lengthCm) return "暂无";

  const meters = record.lengthCm / 100;
  return (record.weightKg / (meters * meters)).toFixed(1);
}

function formatAssessment(input: {
  birthday: Date;
  kind: "weightForAge" | "lengthForAge";
  record: GrowthRecordItem | null;
  sex: ReturnType<typeof normalizeGrowthSex>;
}) {
  if (!input.record) return "暂无参考";

  const value =
    input.kind === "weightForAge"
      ? input.record.weightKg
      : input.record.lengthCm;
  const assessment = getGrowthAssessment({
    sex: input.sex,
    metric: input.kind,
    ageDays: getAgeDays({
      birthday: input.birthday,
      measuredAt: input.record.measuredAt,
    }),
    value,
  });

  return assessment?.label ?? "当前资料不足，暂不生成参考提示。";
}

export function getGrowthToneClass(label: string) {
  if (label.includes("尽快")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (label.includes("随访")) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]";
}

export function buildGrowthPageViewModel(input: {
  child: GrowthChildView;
  latestLength: GrowthRecordItem | null;
  latestWeight: GrowthRecordItem | null;
  records: GrowthRecordItem[];
}) {
  const sex = normalizeGrowthSex(input.child.gender);
  const latestBmiRecord =
    [...input.records]
      .reverse()
      .find((record) => record.weightKg !== null && record.lengthCm !== null) ??
    null;
  const maxAgeDays = getReferenceMaxAgeDays(
    Math.max(
      0,
      ...input.records.map((record) =>
        getAgeDays({
          birthday: input.child.birthday,
          measuredAt: record.measuredAt,
        }),
      ),
    ),
  );

  return {
    latestBmiRecord,
    maxAgeDays,
    recentRecords: [...input.records].reverse().slice(0, 12),
    sex,
    weightAssessment: formatAssessment({
      birthday: input.child.birthday,
      kind: "weightForAge",
      record: input.latestWeight,
      sex,
    }),
    lengthAssessment: formatAssessment({
      birthday: input.child.birthday,
      kind: "lengthForAge",
      record: input.latestLength,
      sex,
    }),
    weightChart: {
      points: buildGrowthChartPoints({
        birthday: input.child.birthday,
        key: "weightKg",
        records: input.records,
      }),
      referenceLines: buildGrowthReferenceLines({
        sex,
        metric: "weightForAge",
        maxAgeDays,
      }),
    },
    lengthChart: {
      points: buildGrowthChartPoints({
        birthday: input.child.birthday,
        key: "lengthCm",
        records: input.records,
      }),
      referenceLines: buildGrowthReferenceLines({
        sex,
        metric: "lengthForAge",
        maxAgeDays,
      }),
    },
  };
}
