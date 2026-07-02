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
      <h1 className="text-2xl font-semibold text-[#37413d]">记录尿布</h1>
      <p className="text-sm text-[#7b7168]">当前宝宝：{childName}</p>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <label className="block">
        <span className="text-sm font-medium text-[#5d6661]">类型</span>
        <select
          className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3"
          name="type"
          defaultValue="wet"
        >
          <option value="wet">尿湿</option>
          <option value="dirty">便便</option>
          <option value="both">都有</option>
        </select>
      </label>
      <details className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] p-3">
        <summary className="cursor-pointer py-1 text-sm font-medium text-[#5d6661]">
          选填详情
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-[#5d6661]">便便颜色</span>
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-3"
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
            <span className="text-sm font-medium text-[#5d6661]">便便性状</span>
            <select
              className="mt-2 min-h-12 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-3"
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
            <span className="text-sm font-medium text-[#5d6661]">备注</span>
            <textarea
              className="mt-2 w-full rounded-lg border border-[var(--border-soft)] bg-white px-3 py-3"
              name="notes"
              rows={3}
            />
          </label>
        </div>
      </details>
      <button className="min-h-14 w-full rounded-lg bg-[var(--accent)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
        保存尿布
      </button>
    </form>
  );
}
