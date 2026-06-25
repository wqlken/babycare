import { createChildAction } from "@/app/actions/children";
import { requireUser } from "@/lib/auth/guards";

type ChildrenPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ChildrenPage({ searchParams }: ChildrenPageProps) {
  await requireUser();
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold text-slate-950">添加第一个宝宝</h1>
      {params?.error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}
      <form action={createChildAction} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">姓名</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="name"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">生日</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="birthday"
            type="date"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">性别</span>
          <select
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
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
            name="notes"
            rows={3}
          />
        </label>
        <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
          保存宝宝资料
        </button>
      </form>
    </main>
  );
}
