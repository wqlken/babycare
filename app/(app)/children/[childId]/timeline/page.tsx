import { getDashboardData } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth/guards";
import { notFound } from "next/navigation";
import { TimelineRecordCard } from "@/components/timeline/timeline-record-card";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export default async function TimelinePage({ params, searchParams }: PageProps) {
  const user = await requireUser();
  const { childId } = await params;
  const [dashboard, query] = await Promise.all([
    getDashboardData(user.id, childId),
    searchParams,
  ]);

  if (!dashboard) {
    notFound();
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">时间线</h1>
        <p className="mt-1 text-sm text-slate-500">
          {dashboard.child?.name ?? "宝宝"} 的最近记录
        </p>
      </div>
      {query?.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}
      <div className="space-y-3">
        {dashboard.timelineItems.map((item) => (
          <TimelineRecordCard
            childId={childId}
            item={item}
            key={`${item.kind}-${item.id}`}
          />
        ))}
        {dashboard.timelineItems.length === 0 ? (
          <p className="rounded border border-slate-200 bg-white p-4 text-slate-600">
            还没有记录。
          </p>
        ) : null}
      </div>
    </section>
  );
}
