import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
      <h1 className="text-3xl font-semibold text-slate-950">登录 Babycare</h1>
      {params?.error ? (
        <p className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      ) : null}
      <form action={loginAction} className="mt-8 space-y-5">
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
            required
          />
        </label>
        <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
          登录
        </button>
      </form>
      <Link className="mt-6 text-sm text-sky-700" href="/register">
        首次使用或接受邀请
      </Link>
    </main>
  );
}
