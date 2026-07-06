import { startSleepAction } from "@/app/actions/sleep";
import { stopSleepAction } from "@/app/actions/sleep";
import { formatDateTimeLocalInput } from "@/lib/time";
import { Moon } from "lucide-react";
import Link from "next/link";

type SleepFormProps = {
  childId: string;
  childName: string;
  error?: string;
};

type ActiveSleepNoticeProps = {
  childId: string;
  childName: string;
  creatorDisplayName?: string | null;
  startTime: Date;
};

function formatStartTime(startTime: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(startTime);
}

function formatDuration(startTime: Date) {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - startTime.getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`;
}

export function ActiveSleepNotice({
  childId,
  childName,
  creatorDisplayName,
  startTime,
}: ActiveSleepNoticeProps) {
  const creatorName = creatorDisplayName?.trim() || "家人";

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          睡眠进行中
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          当前宝宝：{childName}
        </p>
      </div>
      <div className="bc-card space-y-4 p-4">
        <div className="rounded-lg bg-[var(--accent-sleep-soft)] p-4">
          <p className="text-sm font-medium text-[var(--accent-sleep-strong)]">
            已有一段进行中的睡眠
          </p>
          <p className="mt-2 text-[var(--foreground)]">
            开始于 {formatStartTime(startTime)}
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            由 {creatorName} 开始
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            已持续 {formatDuration(startTime)}
          </p>
        </div>
        <form action={stopSleepAction}>
          <input name="childId" type="hidden" value={childId} />
          <button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-sleep-strong)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
            <Moon aria-hidden="true" size={24} />
            结束睡眠
          </button>
        </form>
      </div>
      <Link
        className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
        href="/"
      >
        返回首页
      </Link>
    </section>
  );
}

export function SleepForm({ childId, childName, error }: SleepFormProps) {
  const defaultTime = formatDateTimeLocalInput(new Date());

  return (
    <form action={startSleepAction} className="space-y-5">
      <input name="childId" type="hidden" value={childId} />
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        开始睡眠
      </h1>
      <p className="text-sm text-[var(--text-muted)]">当前宝宝：{childName}</p>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="bc-label">开始时间</span>
        <input
          className="bc-input bc-focus-ring"
          defaultValue={defaultTime}
          name="startTime"
          required
          type="datetime-local"
        />
      </label>
      <label className="block">
        <span className="bc-label">备注</span>
        <textarea
          className="bc-input bc-focus-ring"
          name="notes"
          rows={3}
        />
      </label>
      <button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-sleep-strong)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
        <Moon aria-hidden="true" size={24} />
        开始睡眠
      </button>
      <Link
        className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
        href="/"
      >
        返回首页
      </Link>
    </form>
  );
}
