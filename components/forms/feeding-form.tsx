import {
  createBottleFeedingAction,
  startBreastfeedingAction,
} from "@/app/actions/feedings";

type FeedingFormProps = {
  childId: string;
  error?: string;
};

export function FeedingForm({ childId, error }: FeedingFormProps) {
  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <form action={createBottleFeedingAction} className="space-y-4">
        <input name="childId" type="hidden" value={childId} />
        <h1 className="text-2xl font-semibold">记录瓶喂</h1>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">奶量 ml</span>
          <input
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            inputMode="numeric"
            min={1}
            name="amountMl"
            required
            type="number"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">备注</span>
          <textarea
            className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
            name="notes"
            rows={3}
          />
        </label>
        <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
          保存瓶喂
        </button>
      </form>
      <form action={startBreastfeedingAction} className="space-y-4">
        <input name="childId" type="hidden" value={childId} />
        <h2 className="text-xl font-semibold">开始母乳计时</h2>
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
