import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    invite?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold text-slate-950">创建家庭账号</h1>
      {params?.error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}
      <form action={registerAction} className="mt-8 space-y-5">
        <input name="invite" type="hidden" value={params?.invite ?? ""} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">显示名称</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="displayName"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">邮箱</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="email"
            type="email"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">密码</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="password"
            type="password"
            minLength={8}
            required
          />
        </label>
        <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
          创建账号
        </button>
      </form>
      <Link className="mt-6 text-sm text-sky-700" href="/login">
        已有账号，去登录
      </Link>
    </main>
  );
}
