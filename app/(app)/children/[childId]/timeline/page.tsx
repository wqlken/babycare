import { getDashboardData } from "@/lib/dashboard";

type PageProps = {
  params: Promise<{ childId: string }>;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export default async function TimelinePage({ params }: PageProps) {
  const { childId } = await params;
  const dashboard = await getDashboardData(childId);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">时间线</h1>
        <p className="mt-1 text-sm text-slate-500">
          {dashboard.child?.name ?? "宝宝"} 的最近记录
        </p>
      </div>
      <div className="space-y-3">
        {dashboard.timelineItems.map((item) => (
          <article
            className="rounded border border-slate-200 bg-white p-4"
            key={`${item.kind}-${item.id}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-medium text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {item.creatorDisplayName}
                </p>
              </div>
              <time className="text-sm text-slate-500">{formatTime(item.time)}</time>
            </div>
            {item.notes ? (
              <p className="mt-3 text-sm text-slate-700">{item.notes}</p>
            ) : null}
          </article>
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
