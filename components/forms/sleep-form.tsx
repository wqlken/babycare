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
      <h1 className="text-2xl font-semibold text-[#37413d]">开始睡眠</h1>
      <p className="text-sm text-[#7b7168]">当前宝宝：{childName}</p>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-[#5d6661]">备注</span>
        <textarea
          className="mt-2 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
          name="notes"
          rows={3}
        />
      </label>
      <button className="min-h-14 w-full rounded-lg bg-[#737196] px-4 py-4 text-lg font-semibold text-white shadow-sm">
        开始睡眠
      </button>
    </form>
  );
}
