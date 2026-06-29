import { startSleepAction } from "@/app/actions/sleep";

type SleepFormProps = {
  childId: string;
  childName: string;
  error?: string;
};

export function SleepForm({ childId, childName, error }: SleepFormProps) {
  return (
    <form action={startSleepAction} className="space-y-5">
      <input name="childId" type="hidden" value={childId} />
      <h1 className="text-2xl font-semibold">开始睡眠</h1>
      <p className="text-sm text-slate-500">当前宝宝：{childName}</p>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">备注</span>
        <textarea
          className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
          name="notes"
          rows={3}
        />
      </label>
      <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
        开始睡眠
      </button>
    </form>
  );
}
