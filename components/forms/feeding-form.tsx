import {
  createBottleFeedingAction,
  startBreastfeedingAction,
} from "@/app/actions/feedings";
import { formatDateTimeLocalInput } from "@/lib/time";
import { Milk } from "lucide-react";
import Link from "next/link";

type FeedingFormProps = {
  childId: string;
  childName: string;
  milkUnit?: "ml" | "oz";
  error?: string;
};

export function FeedingForm({
  childId,
  childName,
  milkUnit = "ml",
  error,
}: FeedingFormProps) {
  const amountStep = milkUnit === "oz" ? "0.1" : "1";
  const defaultTime = formatDateTimeLocalInput(new Date());

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <form action={createBottleFeedingAction} className="space-y-4">
        <input name="childId" type="hidden" value={childId} />
        <input name="milkUnit" type="hidden" value={milkUnit} />
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          记录瓶喂
        </h1>
        <p className="text-sm text-[var(--text-muted)]">当前宝宝：{childName}</p>
        <label className="block">
          <span className="bc-label">记录时间</span>
          <input
            className="bc-input bc-focus-ring"
            defaultValue={defaultTime}
            name="eventTime"
            required
            type="datetime-local"
          />
        </label>
        <label className="block">
          <span className="bc-label">奶量 {milkUnit}</span>
          <input
            className="bc-input bc-focus-ring text-lg"
            inputMode="decimal"
            min={1}
            name="amount"
            required
            step={amountStep}
            type="number"
          />
        </label>
        <label className="block">
          <span className="bc-label">内容</span>
          <select
            className="bc-input bc-focus-ring"
            defaultValue="formula"
            name="bottleContent"
          >
            <option value="unknown">未指定</option>
            <option value="formula">配方奶</option>
            <option value="expressed_breast_milk">母乳瓶喂</option>
            <option value="mixed">混合</option>
            <option value="other">其他</option>
          </select>
        </label>
        <label className="block">
          <span className="bc-label">备注</span>
          <textarea
            className="bc-input bc-focus-ring"
            name="notes"
            rows={3}
          />
        </label>
        <button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-feeding-strong)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
          <Milk aria-hidden="true" size={24} />
          保存瓶喂
        </button>
        <Link
          className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
          href="/"
        >
          返回首页
        </Link>
      </form>
      <form action={startBreastfeedingAction} className="space-y-4">
        <input name="childId" type="hidden" value={childId} />
        <input name="breastSide" type="hidden" value="unknown" />
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          开始母乳计时
        </h2>
        <p className="text-sm text-[var(--text-muted)]">当前宝宝：{childName}</p>
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
        <button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-feeding)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
          <Milk aria-hidden="true" size={24} />
          开始母乳
        </button>
        <Link
          className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
          href="/"
        >
          返回首页
        </Link>
      </form>
    </div>
  );
}
