import { notFound } from "next/navigation";
import { GrowthChart } from "@/components/growth/growth-chart";
import { GrowthRecordForm } from "@/components/growth/growth-record-form";
import { requireUser } from "@/lib/auth/guards";
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
) {
  return records.map((record) => ({
    id: `${key}-${record.id}`,
    label: dateFormatter.format(record.measuredAt),
    value: record[key],
  }));
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
          记录家庭日常测量值，先观察连续趋势；医学标准参考与风险提示会在后续版本补充。
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

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <GrowthRecordForm childId={data.child.id} childName={data.child.name} />

      <div className="grid gap-4 lg:grid-cols-2">
        <GrowthChart
          emptyText="保存体重后会生成趋势曲线。"
          points={buildChartPoints(data.records, "weightKg")}
          title="体重曲线"
          unit="kg"
        />
        <GrowthChart
          emptyText="保存身长/身高后会生成趋势曲线。"
          points={buildChartPoints(data.records, "lengthCm")}
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
