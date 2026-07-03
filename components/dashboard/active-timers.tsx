import { stopBreastfeedingAction } from "@/app/actions/feedings";
import { stopSleepAction } from "@/app/actions/sleep";

type ActiveTimersProps = {
  childId: string;
  activeBreastfeeding: { startTime: Date } | null;
  activeSleep: { startTime: Date } | null;
};

function since(startTime: Date) {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - startTime.getTime()) / 60_000),
  );

  if (minutes < 60) {
    return `${minutes}分钟`;
  }

  return `${Math.floor(minutes / 60)}小时${minutes % 60}分钟`;
}

export function ActiveTimers({
  childId,
  activeBreastfeeding,
  activeSleep,
}: ActiveTimersProps) {
  if (!activeBreastfeeding && !activeSleep) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeBreastfeeding ? (
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--accent-feeding-soft)] p-4">
          <p className="text-sm font-medium text-[var(--accent-feeding-strong)]">
            母乳进行中
          </p>
          <p className="mt-1 text-[var(--foreground)]">
            已开始 {since(activeBreastfeeding.startTime)}
          </p>
          <form action={stopBreastfeedingAction} className="mt-3">
            <input name="childId" type="hidden" value={childId} />
            <button className="bc-focus-ring min-h-12 rounded-lg bg-[var(--accent-feeding-strong)] px-4 py-3 text-sm font-medium text-white">
              结束母乳
            </button>
          </form>
        </div>
      ) : null}
      {activeSleep ? (
        <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--accent-sleep-soft)] p-4">
          <p className="text-sm font-medium text-[var(--accent-sleep-strong)]">
            睡眠进行中
          </p>
          <p className="mt-1 text-[var(--foreground)]">
            已开始 {since(activeSleep.startTime)}
          </p>
          <form action={stopSleepAction} className="mt-3">
            <input name="childId" type="hidden" value={childId} />
            <button className="bc-focus-ring min-h-12 rounded-lg bg-[var(--accent-sleep-strong)] px-4 py-3 text-sm font-medium text-white">
              结束睡眠
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
