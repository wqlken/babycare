import {
  createBottleFeedingAction,
  startBreastfeedingAction,
} from "@/app/actions/feedings";

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
        <h1 className="text-2xl font-semibold">记录瓶喂</h1>
        <p className="text-sm text-slate-500">当前宝宝：{childName}</p>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            奶量 {milkUnit}
          </span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            inputMode="decimal"
            min={1}
            name="amount"
            required
            step={amountStep}
            type="number"
          />
        </label>
        <details className="rounded border border-slate-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            选填详情
          </summary>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">内容</span>
              <select
                className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
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
              <span className="text-sm font-medium text-slate-700">备注</span>
              <textarea
                className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
                name="notes"
                rows={3}
              />
            </label>
          </div>
        </details>
        <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
          保存瓶喂
        </button>
      </form>
      <form action={startBreastfeedingAction} className="space-y-4">
        <input name="childId" type="hidden" value={childId} />
        <h2 className="text-xl font-semibold">开始母乳计时</h2>
        <p className="text-sm text-slate-500">当前宝宝：{childName}</p>
        <select
          className="w-full rounded border border-slate-300 px-3 py-2"
          name="breastSide"
          defaultValue="unknown"
        >
          <option value="unknown">未指定</option>
          <option value="left">左侧</option>
          <option value="right">右侧</option>
          <option value="both">两侧</option>
        </select>
        <button className="w-full rounded bg-sky-700 px-4 py-2.5 font-medium text-white">
          开始母乳
        </button>
      </form>
    </div>
  );
}
