import { createDiaperAction } from "@/app/actions/diapers";
import { DiaperTypeFields } from "@/components/forms/diaper-type-fields";
import { formatDateTimeLocalInput } from "@/lib/time";
import { Baby } from "lucide-react";
import Link from "next/link";

type DiaperFormProps = {
  childId: string;
  childName: string;
  error?: string;
};

export function DiaperForm({ childId, childName, error }: DiaperFormProps) {
  const defaultTime = formatDateTimeLocalInput(new Date());

  return (
    <form action={createDiaperAction} className="space-y-5">
      <input name="childId" type="hidden" value={childId} />
      <h1 className="text-2xl font-semibold text-[var(--foreground)]">
        记录尿布
      </h1>
      <p className="text-sm text-[var(--text-muted)]">当前宝宝：{childName}</p>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
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
      <DiaperTypeFields />
      <label className="block">
        <span className="bc-label">备注</span>
        <textarea
          className="bc-input bc-focus-ring"
          name="notes"
          rows={3}
        />
      </label>
      <button className="bc-focus-ring flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent-diaper)] px-4 py-4 text-lg font-semibold text-white shadow-sm">
        <Baby aria-hidden="true" size={24} />
        保存尿布
      </button>
      <Link
        className="bc-touch-link bc-focus-ring flex items-center justify-center px-4 py-3"
        href="/"
      >
        返回首页
      </Link>
    </form>
  );
}
