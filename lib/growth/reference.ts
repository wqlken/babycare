import { growthReference, type GrowthReferenceRow } from "@/lib/growth/reference-data";
import { toLocalDateString } from "@/lib/time";

export type GrowthSex = "female" | "male";
export type GrowthMetric = "weightForAge" | "lengthForAge";

export type GrowthReferencePoint = {
  ageDays: number;
  month: number;
  value: number;
};

export type GrowthReferenceLine = {
  key: string;
  label: string;
  z: number;
  points: GrowthReferencePoint[];
};

export type GrowthAssessment = {
  zScore: number;
  label: string;
  tone: "ok" | "watch" | "alert";
};

const maxReferenceAgeDays = 1096;

export function normalizeGrowthSex(value: string | null): GrowthSex | null {
  return value === "female" || value === "male" ? value : null;
}

export function getAgeDays(input: {
  birthday: Date;
  measuredAt: Date;
  timezone?: string;
}) {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const birthday = toLocalDateString(input.birthday, timezone);
  const measuredAt = toLocalDateString(input.measuredAt, timezone);
  const birthdayUtc = Date.parse(`${birthday}T00:00:00.000Z`);
  const measuredUtc = Date.parse(`${measuredAt}T00:00:00.000Z`);

  return Math.max(0, Math.round((measuredUtc - birthdayUtc) / 86_400_000));
}

function interpolateRow(
  rows: GrowthReferenceRow[],
  ageDays: number,
): GrowthReferenceRow | null {
  if (ageDays < rows[0].day || ageDays > rows[rows.length - 1].day) {
    return null;
  }

  const exact = rows.find((row) => row.day === ageDays);
  if (exact) return exact;

  const upperIndex = rows.findIndex((row) => row.day > ageDays);
  if (upperIndex <= 0) return rows[0];

  const lower = rows[upperIndex - 1];
  const upper = rows[upperIndex];
  const ratio = (ageDays - lower.day) / (upper.day - lower.day);

  return {
    month: lower.month + (upper.month - lower.month) * ratio,
    day: ageDays,
    l: lower.l + (upper.l - lower.l) * ratio,
    m: lower.m + (upper.m - lower.m) * ratio,
    s: lower.s + (upper.s - lower.s) * ratio,
  };
}

export function getReferenceValue(row: GrowthReferenceRow, z: number) {
  if (row.l === 0) {
    return row.m * Math.exp(row.s * z);
  }

  return row.m * Math.pow(1 + row.l * row.s * z, 1 / row.l);
}

export function getZScore(input: {
  sex: GrowthSex;
  metric: GrowthMetric;
  ageDays: number;
  value: number;
}) {
  const rows = growthReference[input.sex][input.metric];
  const row = interpolateRow(rows, input.ageDays);

  if (!row) return null;

  if (row.l === 0) {
    return Math.log(input.value / row.m) / row.s;
  }

  return (Math.pow(input.value / row.m, row.l) - 1) / (row.l * row.s);
}

export function describeZScore(zScore: number): GrowthAssessment {
  if (zScore <= -3) {
    return {
      zScore,
      label: "低于 -3SD，建议尽快结合儿保医生评估。",
      tone: "alert",
    };
  }

  if (zScore < -2) {
    return {
      zScore,
      label: "低于 -2SD，建议结合近期趋势和儿保随访。",
      tone: "watch",
    };
  }

  if (zScore >= 3) {
    return {
      zScore,
      label: "高于 +3SD，建议结合儿保医生评估。",
      tone: "alert",
    };
  }

  if (zScore > 2) {
    return {
      zScore,
      label: "高于 +2SD，建议结合近期趋势和儿保随访。",
      tone: "watch",
    };
  }

  return {
    zScore,
    label: "位于 -2SD 到 +2SD 参考区间内。",
    tone: "ok",
  };
}

export function getGrowthAssessment(input: {
  sex: GrowthSex | null;
  metric: GrowthMetric;
  ageDays: number;
  value: number | null;
}) {
  if (!input.sex || input.value === null || input.ageDays > maxReferenceAgeDays) {
    return null;
  }

  const zScore = getZScore({
    sex: input.sex,
    metric: input.metric,
    ageDays: input.ageDays,
    value: input.value,
  });

  return zScore === null ? null : describeZScore(zScore);
}

export function buildGrowthReferenceLines(input: {
  sex: GrowthSex | null;
  metric: GrowthMetric;
  maxAgeDays: number;
}): GrowthReferenceLine[] {
  if (!input.sex) return [];

  const rows = growthReference[input.sex][input.metric].filter(
    (row) => row.day <= Math.min(input.maxAgeDays, maxReferenceAgeDays),
  );
  const lines = [
    { key: "minus2", label: "-2SD", z: -2 },
    { key: "median", label: "M", z: 0 },
    { key: "plus2", label: "+2SD", z: 2 },
  ];

  return lines.map((line) => ({
    ...line,
    points: rows.map((row) => ({
      ageDays: row.day,
      month: row.month,
      value: getReferenceValue(row, line.z),
    })),
  }));
}

export function getReferenceMaxAgeDays(ageDays: number) {
  const sixMonths = 183;
  const oneYear = 365;
  const padded = Math.ceil((ageDays + 30) / sixMonths) * sixMonths;

  return Math.min(maxReferenceAgeDays, Math.max(oneYear, padded));
}
