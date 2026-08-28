"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateGrowthRecordAction } from "@/app/actions/growth";
import { AppDrawer } from "@/components/ui/app-drawer";
import type { GrowthRecordItem } from "@/lib/growth/service";
import { formatGrowthRecordSummary } from "@/lib/growth/view-model";
import { formatDateTimeLocalInput } from "@/lib/time";

type GrowthRecentListProps = {
  childId: string;
  records: GrowthRecordItem[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function GrowthRecentListItem({
  childId,
  record,
}: {
  childId: string;
  record: GrowthRecordItem;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium text-[var(--foreground)]">
          {formatGrowthRecordSummary(record)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--text-muted)]">
          <span>{dateTimeFormatter.format(record.measuredAt)}</span>
          <span>{record.creatorDisplayName}</span>
        </div>
        {record.notes ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-muted)]">
            {record.notes}
          </p>
        ) : null}
      </div>
      <button
        aria-label="编辑生长记录"
        className="bc-focus-ring flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)]"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Pencil aria-hidden="true" size={18} />
      </button>
      <AppDrawer
        description="更新测量时间、体重、身长/身高和备注。"
        onClose={() => setOpen(false)}
        open={open}
        title="编辑测量记录"
      >
        <form action={updateGrowthRecordAction} className="space-y-4">
          <input name="childId" type="hidden" value={childId} />
          <input name="recordId" type="hidden" value={record.id} />
          <label className="block">
            <span className="bc-label">测量时间</span>
            <input
              className="bc-input bc-focus-ring"
              defaultValue={formatDateTimeLocalInput(record.measuredAt)}
              name="measuredAt"
              required
              type="datetime-local"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="bc-label">体重 kg</span>
              <input
                className="bc-input bc-focus-ring text-lg"
                defaultValue={record.weightKg ?? ""}
                inputMode="decimal"
                min={0.5}
                name="weightKg"
                placeholder="例如 4.2"
                step="0.01"
                type="number"
              />
            </label>
            <label className="block">
              <span className="bc-label">身长/身高 cm</span>
              <input
                className="bc-input bc-focus-ring text-lg"
                defaultValue={record.lengthCm ?? ""}
                inputMode="decimal"
                min={20}
                name="lengthCm"
                placeholder="例如 55.5"
                step="0.1"
                type="number"
              />
            </label>
          </div>
          <label className="block">
            <span className="bc-label">备注</span>
            <textarea
              className="bc-input bc-focus-ring"
              defaultValue={record.notes ?? ""}
              name="notes"
              rows={3}
            />
          </label>
          <button className="bc-focus-ring min-h-12 w-full rounded-lg bg-[var(--accent-growth)] px-4 text-base font-semibold text-white">
            保存测量记录
          </button>
        </form>
      </AppDrawer>
    </div>
  );
}

export function GrowthRecentList({ childId, records }: GrowthRecentListProps) {
  return (
    <div className="bc-card p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          最近测量
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          最近 {records.length} 条
        </p>
      </div>
      {records.length > 0 ? (
        <div className="mt-4 divide-y divide-[var(--border-soft)]">
          {records.map((record) => (
            <GrowthRecentListItem
              childId={childId}
              key={record.id}
              record={record}
            />
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
          暂无测量记录。
        </p>
      )}
    </div>
  );
}
