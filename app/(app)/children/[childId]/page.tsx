import { updateChildAction } from "@/app/actions/children";
import { requireUser } from "@/lib/auth/guards";
import { getAccessibleChild } from "@/lib/children/service";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function ChildDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireUser();
  const { childId } = await params;
  const [child, query] = await Promise.all([
    getAccessibleChild(user.id, childId),
    searchParams,
  ]);

  if (!child) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">宝宝资料</h1>
        <p className="mt-1 text-sm text-slate-500">更新姓名、生日和备注。</p>
      </div>
      {query?.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}
      {query?.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          已保存宝宝资料。
        </p>
      ) : null}
      <form action={updateChildAction} className="space-y-5 rounded border border-slate-200 bg-white p-4">
        <input name="childId" type="hidden" value={child.id} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">姓名</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={child.name}
            name="name"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">生日</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={toDateInputValue(child.birthday)}
            name="birthday"
            type="date"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">性别</span>
          <select
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={child.gender ?? ""}
            name="gender"
          >
            <option value="">未填写</option>
            <option value="female">女</option>
            <option value="male">男</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">备注</span>
          <textarea
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={child.notes ?? ""}
            name="notes"
            rows={3}
          />
        </label>
        <button className="rounded bg-slate-950 px-4 py-2 font-medium text-white">
          保存资料
        </button>
      </form>
    </section>
  );
}
