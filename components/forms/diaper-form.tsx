import { createDiaperAction } from "@/app/actions/diapers";

type DiaperFormProps = {
  childId: string;
  childName: string;
  error?: string;
};

export function DiaperForm({ childId, childName, error }: DiaperFormProps) {
  return (
    <form action={createDiaperAction} className="space-y-5">
      <input name="childId" type="hidden" value={childId} />
      <h1 className="text-2xl font-semibold">记录尿布</h1>
      <p className="text-sm text-slate-500">当前宝宝：{childName}</p>
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
      <details className="rounded border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">
          选填详情
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">便便颜色</span>
            <select
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
              defaultValue=""
              name="stoolColor"
            >
              <option value="">未指定</option>
              <option value="yellow">黄色</option>
              <option value="brown">棕色</option>
              <option value="green">绿色</option>
              <option value="black">黑色</option>
              <option value="red">红色</option>
              <option value="white">白色</option>
              <option value="other">其他</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">便便性状</span>
            <select
              className="mt-2 w-full rounded border border-slate-300 px-3 py-2"
              defaultValue=""
              name="stoolConsistency"
            >
              <option value="">未指定</option>
              <option value="watery">水样</option>
              <option value="loose">稀软</option>
              <option value="soft">软便</option>
              <option value="formed">成形</option>
              <option value="hard">偏硬</option>
              <option value="mucousy">黏液</option>
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
        保存尿布
      </button>
    </form>
  );
}
