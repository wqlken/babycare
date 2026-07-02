import { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { ChildSwitcher } from "@/components/child-switcher";
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border-soft)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <ChildSwitcher
            childrenList={childList}
            currentChildId={currentChildId}
          />
          <div className="flex flex-wrap items-center gap-2">
            {currentChildId ? (
              <Link
                className="rounded border border-[var(--border-soft)] bg-white/60 px-3 py-2 text-sm font-medium text-[#4a514e]"
                href={`/children/${currentChildId}`}
              >
                宝宝资料
              </Link>
            ) : null}
            <Link
              className="rounded border border-[var(--border-soft)] bg-white/60 px-3 py-2 text-sm font-medium text-[#4a514e]"
              href="/settings/family"
            >
              家庭
            </Link>
            <Link
              className="rounded border border-[var(--border-soft)] bg-white/60 px-3 py-2 text-sm font-medium text-[#4a514e]"
              href="/settings/account"
            >
              账号
            </Link>
            <form action={logoutAction}>
              <button className="rounded border border-[var(--border-soft)] bg-white/60 px-3 py-2 text-sm font-medium text-[#4a514e]">
                退出
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
