import { getDashboardData } from "@/lib/dashboard";
import { requireUser } from "@/lib/auth/guards";
import { notFound } from "next/navigation";
import { deleteRecordAction } from "@/app/actions/records";
import { updateBottleFeedingAction } from "@/app/actions/feedings";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{ error?: string }>;
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
            {item.kind === "feeding" && item.title.startsWith("瓶喂") ? (
              <form
                action={updateBottleFeedingAction}
                className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_2fr_auto]"
              >
                <input name="childId" type="hidden" value={childId} />
                <input name="recordId" type="hidden" value={item.id} />
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">奶量 ml</span>
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    defaultValue={item.amountMl ?? ""}
                    min={1}
                    name="amountMl"
                    required
                    type="number"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">备注</span>
                  <input
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    defaultValue={item.notes ?? ""}
                    name="notes"
                  />
                </label>
                <button className="self-end rounded bg-slate-950 px-3 py-1.5 text-sm font-medium text-white">
                  保存
                </button>
              </form>
            ) : null}
            <form action={deleteRecordAction} className="mt-3">
              <input name="childId" type="hidden" value={childId} />
              <input name="kind" type="hidden" value={item.kind} />
              <input name="recordId" type="hidden" value={item.id} />
              <button className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">
                删除
              </button>
            </form>
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
