import {
  archiveChildAction,
  unarchiveChildAction,
} from "@/app/actions/children";
import { ChildProfileEditDrawer } from "@/components/children/child-profile-edit-drawer";
import { requireUser } from "@/lib/auth/guards";
import { getManageableChild } from "@/lib/children/service";
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

function formatGender(gender: string | null) {
  if (gender === "female") return "女";
  if (gender === "male") return "男";

  return "未填写";
}

export default async function ChildDetailPage({
  params,
  searchParams,
}: PageProps) {
  const user = await requireUser();
  const { childId } = await params;
  const [child, query] = await Promise.all([
    getManageableChild(user.id, childId),
    searchParams,
  ]);

  if (!child) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            宝宝资料
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            查看宝宝基础信息，需要调整时再进入编辑。
          </p>
        </div>
        <ChildProfileEditDrawer
          child={{
            birthday: toDateInputValue(child.birthday),
            gender: child.gender,
            id: child.id,
            name: child.name,
            notes: child.notes,
          }}
        />
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
      {child.archivedAt ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          该宝宝已归档，普通记录入口会隐藏，恢复后可继续记录。
        </p>
      ) : null}
      <div className="bc-card p-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          当前资料
        </h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-3">
            <dt className="text-[var(--text-muted)]">姓名</dt>
            <dd className="mt-1 font-semibold text-[var(--foreground)]">
              {child.name}
            </dd>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-3">
            <dt className="text-[var(--text-muted)]">生日</dt>
            <dd className="mt-1 font-semibold text-[var(--foreground)]">
              {toDateInputValue(child.birthday)}
            </dd>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-3">
            <dt className="text-[var(--text-muted)]">性别</dt>
            <dd className="mt-1 font-semibold text-[var(--foreground)]">
              {formatGender(child.gender)}
            </dd>
          </div>
          <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-3">
            <dt className="text-[var(--text-muted)]">归档状态</dt>
            <dd className="mt-1 font-semibold text-[var(--foreground)]">
              {child.archivedAt ? "已归档" : "正常使用"}
            </dd>
          </div>
        </dl>
        {child.notes ? (
          <div className="mt-3 rounded-lg bg-[var(--surface-muted)] px-3 py-3">
            <p className="text-sm text-[var(--text-muted)]">备注</p>
            <p className="mt-1 text-sm text-[var(--foreground)]">
              {child.notes}
            </p>
          </div>
        ) : null}
      </div>
      <form
        action={child.archivedAt ? unarchiveChildAction : archiveChildAction}
        className="bc-card space-y-3 p-4"
      >
        <input name="childId" type="hidden" value={child.id} />
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          归档状态
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {child.archivedAt
            ? "恢复后会重新出现在宝宝切换和记录入口中。"
            : "归档后会从默认宝宝选择中隐藏，并阻止继续添加普通记录。"}
        </p>
        <button className="bc-focus-ring min-h-11 rounded-lg border border-[var(--border-soft)] px-4 text-sm font-semibold text-[var(--foreground)]">
          {child.archivedAt ? "恢复宝宝" : "归档宝宝"}
        </button>
      </form>
    </section>
  );
}
