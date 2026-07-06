import { ReactNode } from "react";
import Link from "next/link";
import { Baby, BarChart3, Clock3, Home, Milk, Moon } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { ChildSwitcher } from "@/components/child-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import type { listAccessibleChildren } from "@/lib/children/service";

type AppShellProps = {
  children: ReactNode;
  childList: Awaited<ReturnType<typeof listAccessibleChildren>>;
  currentChildId?: string;
};

export function AppShell({
  children,
  childList,
  currentChildId,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-[var(--space-safe-bottom)] text-[var(--foreground)] md:pb-0">
      <header className="border-b border-[var(--border-soft)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <ChildSwitcher
            childrenList={childList}
            currentChildId={currentChildId}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Link
              className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
              href="/"
            >
              首页
            </Link>
            {currentChildId ? (
              <>
                <Link
                  className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                  href={`/children/${currentChildId}/summary`}
                >
                  汇总
                </Link>
                <Link
                  className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
                  href={`/children/${currentChildId}`}
                >
                  宝宝资料
                </Link>
              </>
            ) : null}
            <Link
              className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
              href="/settings/family"
            >
              家庭
            </Link>
            <Link
              className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]"
              href="/settings/account"
            >
              账号
            </Link>
            <ThemeToggle />
            <form action={logoutAction}>
              <button className="bc-focus-ring rounded border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground)]">
                退出
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      {currentChildId ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-soft)] bg-[var(--surface)]/95 px-3 pb-3 pt-2 shadow-[0_-8px_24px_rgb(0_0_0_/_0.08)] backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
            <Link
              className="bc-focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium text-[var(--foreground)]"
              href="/"
            >
              <Home aria-hidden="true" size={24} />
              首页
            </Link>
            <Link
              className="bc-focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium text-[var(--foreground)]"
              href={`/children/${currentChildId}/timeline`}
            >
              <Clock3 aria-hidden="true" size={24} />
              时间线
            </Link>
            <Link
              className="bc-focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-sm font-medium text-[var(--foreground)]"
              href={`/children/${currentChildId}/summary`}
            >
              <BarChart3 aria-hidden="true" size={24} />
              汇总
            </Link>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
              <Link
                aria-label="记录喂养"
                className="bc-focus-ring flex min-h-12 items-center justify-center rounded-md bg-[var(--accent-feeding)] text-white"
                href={`/children/${currentChildId}/feedings/new`}
              >
                <Milk aria-hidden="true" size={24} />
              </Link>
              <Link
                aria-label="记录尿布"
                className="bc-focus-ring flex min-h-12 items-center justify-center rounded-md bg-[var(--accent-diaper)] text-white"
                href={`/children/${currentChildId}/diapers/new`}
              >
                <Baby aria-hidden="true" size={24} />
              </Link>
              <Link
                aria-label="开始睡眠"
                className="bc-focus-ring flex min-h-12 items-center justify-center rounded-md bg-[var(--accent-sleep)] text-white"
                href={`/children/${currentChildId}/sleep`}
              >
                <Moon aria-hidden="true" size={24} />
              </Link>
            </div>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
