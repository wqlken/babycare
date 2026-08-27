import { notFound } from "next/navigation";
import { GrowthChart } from "@/components/growth/growth-chart";
import { GrowthRecordForm } from "@/components/growth/growth-record-form";
import { requireUser } from "@/lib/auth/guards";
import {
  buildGrowthReferenceLines,
  getAgeDays,
  getGrowthAssessment,
  getReferenceMaxAgeDays,
  normalizeGrowthSex,
} from "@/lib/growth/reference";
import { getGrowthData, type GrowthRecordItem } from "@/lib/growth/service";

type GrowthPageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatDecimal(value: number, digits = 1) {
  return Number.isInteger(value) ? String(value) : value.toFixed(digits);
}

function formatMeasurement(record: GrowthRecordItem | null, unit: string) {
  if (!record) return "暂无";

  const value = unit === "kg" ? record.weightKg : record.lengthCm;
  return value === null ? "暂无" : `${formatDecimal(value)}${unit}`;
}

function buildChartPoints(
  records: GrowthRecordItem[],
  key: "weightKg" | "lengthCm",
  birthday: Date,
) {
  return records.map((record) => ({
    id: `${key}-${record.id}`,
    label: dateFormatter.format(record.measuredAt),
    ageDays: getAgeDays({ birthday, measuredAt: record.measuredAt }),
    value: record[key],
  }));
}

function formatAssessment(
  record: GrowthRecordItem | null,
  kind: "weightForAge" | "lengthForAge",
  sex: ReturnType<typeof normalizeGrowthSex>,
  birthday: Date,
) {
  if (!record) return "暂无参考";

  const value = kind === "weightForAge" ? record.weightKg : record.lengthCm;
  const assessment = getGrowthAssessment({
    sex,
    metric: kind,
    ageDays: getAgeDays({ birthday, measuredAt: record.measuredAt }),
    value,
  });

  return assessment?.label ?? "当前资料不足，暂不生成参考提示。";
}

function getToneClass(label: string) {
  if (label.includes("尽快")) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (label.includes("随访")) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-muted)]";
}

function formatBmi(record: GrowthRecordItem | null) {
  if (!record?.weightKg || !record.lengthCm) return "暂无";

  const meters = record.lengthCm / 100;
  return (record.weightKg / (meters * meters)).toFixed(1);
}

function formatRecordSummary(record: GrowthRecordItem) {
  const parts = [];

  if (record.weightKg !== null) {
    parts.push(`体重 ${formatDecimal(record.weightKg)}kg`);
  }

  if (record.lengthCm !== null) {
    parts.push(`身长/身高 ${formatDecimal(record.lengthCm)}cm`);
  }

  return parts.join(" · ");
}

export default async function GrowthPage({
  params,
  searchParams,
}: GrowthPageProps) {
  const user = await requireUser();
  const [{ childId }, query] = await Promise.all([params, searchParams]);
  const data = await getGrowthData(user.id, childId);

  if (!data.ok) {
    notFound();
  }

  const recentRecords = [...data.records].reverse().slice(0, 12);
  const sex = normalizeGrowthSex(data.child.gender);
  const latestBmiRecord =
    [...data.records]
      .reverse()
      .find((record) => record.weightKg !== null && record.lengthCm !== null) ??
    null;
  const maxAgeDays = getReferenceMaxAgeDays(
    Math.max(
      0,
      ...data.records.map((record) =>
        getAgeDays({
          birthday: data.child.birthday,
          measuredAt: record.measuredAt,
        }),
      ),
    ),
  );
  const weightAssessment = formatAssessment(
    data.latestWeight,
    "weightForAge",
    sex,
    data.child.birthday,
  );
  const lengthAssessment = formatAssessment(
    data.latestLength,
    "lengthForAge",
    sex,
    data.child.birthday,
  );

  return (
    <section className="space-y-6">
      <div className="bc-card px-4 py-5">
        <p className="text-sm font-medium text-[var(--accent-growth-strong)]">
          生长记录
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
          {data.child.name} 的身长/身高与体重
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          按性别和月龄叠加 0-3 岁参考区间，用于家庭趋势观察；具体儿保结论仍以医生评估为准。
        </p>
      </div>

      {query?.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}
      {query?.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          已保存生长记录。
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bc-card p-4">
          <p className="text-sm text-[var(--text-muted)]">最新体重</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {formatMeasurement(data.latestWeight, "kg")}
          </p>
        </div>
        <div className="bc-card p-4">
          <p className="text-sm text-[var(--text-muted)]">最新身长/身高</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {formatMeasurement(data.latestLength, "cm")}
          </p>
        </div>
        <div className="bc-card p-4">
          <p className="text-sm text-[var(--text-muted)]">记录次数</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {data.records.length} 次
          </p>
        </div>
        <div className="bc-card p-4">
          <p className="text-sm text-[var(--text-muted)]">最新 BMI</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
            {formatBmi(latestBmiRecord)}
          </p>
        </div>
      </div>

      <div className="bc-card space-y-3 p-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            参考提示
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            当前依据宝宝性别和测量日龄显示 -2SD 到 +2SD 区间提示。
          </p>
        </div>
        {!sex ? (
          <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            宝宝资料未填写男/女性别，暂不显示标准参考提示。
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <p
            className={`rounded border px-3 py-2 text-sm ${getToneClass(
              weightAssessment,
            )}`}
          >
            体重：{weightAssessment}
          </p>
          <p
            className={`rounded border px-3 py-2 text-sm ${getToneClass(
              lengthAssessment,
            )}`}
          >
            身长/身高：{lengthAssessment}
          </p>
        </div>
      </div>

      <GrowthRecordForm childId={data.child.id} childName={data.child.name} />

      <div className="grid gap-4 lg:grid-cols-2">
        <GrowthChart
          emptyText="保存体重后会生成趋势曲线。"
          maxAgeDays={maxAgeDays}
          points={buildChartPoints(data.records, "weightKg", data.child.birthday)}
          referenceLines={buildGrowthReferenceLines({
            sex,
            metric: "weightForAge",
            maxAgeDays,
          })}
          title="体重曲线"
          unit="kg"
        />
        <GrowthChart
          emptyText="保存身长/身高后会生成趋势曲线。"
          maxAgeDays={maxAgeDays}
          points={buildChartPoints(data.records, "lengthCm", data.child.birthday)}
          referenceLines={buildGrowthReferenceLines({
            sex,
            metric: "lengthForAge",
            maxAgeDays,
          })}
          title="身长/身高曲线"
          unit="cm"
        />
      </div>

      <div className="bc-card p-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            最近测量
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            最近 {recentRecords.length} 条
          </p>
        </div>
        {recentRecords.length > 0 ? (
          <div className="mt-4 divide-y divide-[var(--border-soft)]">
            {recentRecords.map((record) => (
              <div
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                key={record.id}
              >
                <div>
                  <p className="font-medium text-[var(--foreground)]">
                    {formatRecordSummary(record)}
                  </p>
                  {record.notes ? (
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {record.notes}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {dateTimeFormatter.format(record.measuredAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
            暂无测量记录。
          </p>
        )}
      </div>
    </section>
  );
}
