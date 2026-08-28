import { createGrowthRecordAction } from "@/app/actions/growth";
import { formatDateTimeLocalInput } from "@/lib/time";
import { Ruler } from "lucide-react";
import Link from "next/link";

type GrowthRecordFormProps = {
  childId: string;
  childName: string;
  framed?: boolean;
  showReturnHome?: boolean;
};

export function GrowthRecordForm({
  childId,
  childName,
  framed = true,
  showReturnHome = true,
}: GrowthRecordFormProps) {
  const defaultTime = formatDateTimeLocalInput(new Date());

  return (
    <form
      action={createGrowthRecordAction}
      className={framed ? "bc-card space-y-4 p-4" : "space-y-4"}
    >
      <input name="childId" type="hidden" value={childId} />
      <div>
        {framed ? (
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            新增测量
          </h2>
        ) : null}
        <p
          className={
            framed
              ? "mt-1 text-sm text-[var(--text-muted)]"
              : "text-sm text-[var(--text-muted)]"
          }
        >
          当前宝宝：{childName}
        </p>
      </div>
      <label className="block">
        <span className="bc-label">测量时间</span>
        <input
          className="bc-input bc-focus-ring"
          defaultValue={defaultTime}
          name="measuredAt"
          required
          type="datetime-local"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="bc-label">体重 kg</span>
          <input
            className="bc-input bc-focus-ring text-lg"
            inputMode="decimal"
            min={0.5}
            name="weightKg"
            placeholder="例如 4.2"
            step="0.01"
            type="number"
          />
        </label>
        <label className="block">
          <span className="bc-label">身长/身高 cm</span>
          <input
            className="bc-input bc-focus-ring text-lg"
            inputMode="decimal"
            min={20}
            name="lengthCm"
            placeholder="例如 55.5"
            step="0.1"
            type="number"
          />
        </label>
      </div>
      <label className="block">
        <span className="bc-label">备注</span>
        <textarea className="bc-input bc-focus-ring" name="notes" rows={3} />
      </label>
      <button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-growth)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
        <Ruler aria-hidden="true" size={24} />
        保存生长记录
      </button>
      {showReturnHome ? (
        <Link
          className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
          href="/"
        >
          返回首页
        </Link>
      ) : null}
    </form>
  );
}
