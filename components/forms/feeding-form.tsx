import {
  createBottleFeedingAction,
  startBreastfeedingAction,
} from "@/app/actions/feedings";
import { formatDateTimeLocalInput } from "@/lib/time";
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
        <h1 className="text-2xl font-semibold text-[#37413d]">记录瓶喂</h1>
        <p className="text-sm text-[#7b7168]">当前宝宝：{childName}</p>
        <label className="block">
          <span className="text-sm font-medium text-[#5d6661]">记录时间</span>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
            defaultValue={defaultTime}
            name="eventTime"
            required
            type="datetime-local"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#5d6661]">
            奶量 {milkUnit}
          </span>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3 text-lg"
            inputMode="decimal"
            min={1}
            name="amount"
            required
            step={amountStep}
            type="number"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#5d6661]">内容</span>
          <select
            className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
            defaultValue="unknown"
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
          <span className="text-sm font-medium text-[#5d6661]">备注</span>
          <textarea
            className="mt-2 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
            name="notes"
            rows={3}
          />
        </label>
        <button className="min-h-14 w-full rounded-lg bg-[var(--primary-strong)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
          保存瓶喂
        </button>
        <Link
          className="flex min-h-12 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 font-medium text-[#5d6661]"
          href="/"
        >
          返回首页
        </Link>
      </form>
      <form action={startBreastfeedingAction} className="space-y-4">
        <input name="childId" type="hidden" value={childId} />
        <h2 className="text-xl font-semibold text-[#37413d]">开始母乳计时</h2>
        <p className="text-sm text-[#7b7168]">当前宝宝：{childName}</p>
        <label className="block">
          <span className="text-sm font-medium text-[#5d6661]">开始时间</span>
          <input
            className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
            defaultValue={defaultTime}
            name="startTime"
            required
            type="datetime-local"
          />
        </label>
        <select
          className="min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
          name="breastSide"
          defaultValue="unknown"
        >
          <option value="unknown">未指定</option>
          <option value="left">左侧</option>
          <option value="right">右侧</option>
          <option value="both">两侧</option>
        </select>
        <button className="min-h-14 w-full rounded-lg bg-[var(--primary)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
          开始母乳
        </button>
        <Link
          className="flex min-h-12 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 font-medium text-[#5d6661]"
          href="/"
        >
          返回首页
        </Link>
      </form>
    </div>
  );
}
