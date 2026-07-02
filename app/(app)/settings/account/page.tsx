import {
  updatePasswordAction,
  updatePreferencesAction,
  updateProfileAction,
} from "@/app/actions/account";
import { requireUser } from "@/lib/auth/guards";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AccountSettingsPage({ searchParams }: PageProps) {
  const [user, query] = await Promise.all([requireUser(), searchParams]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">账号设置</h1>
        <p className="mt-1 text-sm text-slate-500">更新个人资料和登录密码。</p>
      </div>
      {query?.error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}
      {query?.saved ? (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          已保存账号设置。
        </p>
      ) : null}
      <form action={updateProfileAction} className="space-y-5 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">个人资料</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">显示名称</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={user.displayName}
            name="displayName"
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">邮箱</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={user.email}
            name="email"
            type="email"
            required
          />
        </label>
        <button className="rounded bg-slate-950 px-4 py-2 font-medium text-white">
          保存资料
        </button>
      </form>
      <form action={updatePreferencesAction} className="space-y-5 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">记录偏好</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">奶量单位</span>
          <select
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            defaultValue={user.preference?.milkUnit === "oz" ? "oz" : "ml"}
            name="milkUnit"
          >
            <option value="ml">毫升 ml</option>
            <option value="oz">盎司 oz</option>
          </select>
        </label>
        <button className="rounded bg-slate-950 px-4 py-2 font-medium text-white">
          保存偏好
        </button>
      </form>
      <form action={updatePasswordAction} className="space-y-5 rounded border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold">修改密码</h2>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">当前密码</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="currentPassword"
            required
            type="password"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">新密码</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            minLength={8}
            name="newPassword"
            required
            type="password"
          />
        </label>
        <button className="rounded bg-slate-950 px-4 py-2 font-medium text-white">
          修改密码
        </button>
      </form>
    </section>
  );
}
