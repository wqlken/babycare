import Link from "next/link";

type SummaryPageHeaderProps = {
  childName: string;
};

export function SummaryPageHeader({ childName }: SummaryPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[var(--primary-strong)]">
          {childName}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[#37413d]">
          历史汇总
        </h1>
        <p className="mt-2 text-sm text-[#766e66]">
          按日期范围查看喂养、尿布和睡眠的每日汇总。
        </p>
      </div>
      <Link
        className="bc-focus-ring inline-flex min-h-11 items-center justify-center rounded border border-[var(--border-soft)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--foreground)]"
        href="/"
      >
        返回首页
      </Link>
    </div>
  );
}
