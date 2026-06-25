import { createDiaperAction } from "@/app/actions/diapers";

type DiaperFormProps = {
  childId: string;
  error?: string;
};

export function DiaperForm({ childId, error }: DiaperFormProps) {
  return (
    <form action={createDiaperAction} className="space-y-5">
      <input name="childId" type="hidden" value={childId} />
      <h1 className="text-2xl font-semibold">记录尿布</h1>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-slate-700">类型</span>
        <select
          className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
          name="type"
          defaultValue="wet"
        >
          <option value="wet">尿湿</option>
          <option value="dirty">便便</option>
          <option value="both">都有</option>
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
      <button className="w-full rounded bg-slate-950 px-4 py-2.5 font-medium text-white">
        保存尿布
      </button>
    </form>
  );
}
