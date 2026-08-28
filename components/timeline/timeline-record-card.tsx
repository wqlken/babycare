"use client";

import { useState } from "react";
import { deleteRecordAction } from "@/app/actions/records";
import { TimelineEditor } from "@/components/timeline/timeline-editor";
import { AppDrawer } from "@/components/ui/app-drawer";
import {
  formatItemTime,
  getDetailText,
} from "@/components/timeline/timeline-formatters";
import type { TimelineItem } from "@/lib/timeline";
import { MoreHorizontal, Trash2 } from "lucide-react";

type TimelineRecordCardProps = {
  childId: string;
  item: TimelineItem;
  returnDate?: string;
};

export function TimelineRecordCard({
  childId,
  item,
  returnDate,
}: TimelineRecordCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const detailText = getDetailText(item);

  return (
    <article className="rounded-lg border border-[var(--border-soft)] bg-[var(--surface)] px-3 py-3">
      <div className="grid grid-cols-[4.75rem_1fr_auto] gap-3">
        <time className="pt-0.5 text-sm font-semibold tabular-nums text-[var(--text-muted)]">
          {formatItemTime(item)}
        </time>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="font-semibold text-[var(--foreground)]">
              {item.title}
            </h2>
            {detailText ? (
              <p className="text-sm text-[var(--text-muted)]">{detailText}</p>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {item.creatorDisplayName}
            {item.edited ? " · 已编辑" : ""}
          </p>
          {item.notes ? (
            <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]">
              {item.notes}
            </p>
          ) : null}
        </div>
        <button
          aria-expanded={drawerOpen}
          aria-label="查看记录详情"
          className="bc-focus-ring flex size-10 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)]"
          onClick={() => setDrawerOpen(true)}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" size={20} />
        </button>
      </div>
      <AppDrawer
        description="查看完整内容，必要时再编辑或删除。"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        title="记录详情"
      >
        <div className="space-y-5">
          <div className="rounded-lg bg-[var(--surface-muted)] px-3 py-3">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              {detailText ? (
                <p className="text-sm text-[var(--text-muted)]">
                  {detailText}
                </p>
              ) : null}
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--text-muted)]">时间</dt>
                <dd className="font-medium tabular-nums text-[var(--foreground)]">
                  {formatItemTime(item)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--text-muted)]">记录人</dt>
                <dd className="font-medium text-[var(--foreground)]">
                  {item.creatorDisplayName}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[var(--text-muted)]">状态</dt>
                <dd className="font-medium text-[var(--foreground)]">
                  {item.edited ? "已编辑" : "原始记录"}
                </dd>
              </div>
            </dl>
            {item.notes ? (
              <p className="mt-3 rounded-lg bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]">
                {item.notes}
              </p>
            ) : null}
          </div>

          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">
              编辑记录
            </h3>
            <TimelineEditor
              childId={childId}
              item={item}
              onCancel={() => setDrawerOpen(false)}
              returnDate={returnDate}
            />
          </div>

          <form
            action={deleteRecordAction}
            className="border-t border-[var(--border-soft)] pt-4"
            onSubmit={(event) => {
              if (!window.confirm("确定要删除这条记录吗？")) {
                event.preventDefault();
              }
            }}
          >
            <input name="childId" type="hidden" value={childId} />
            <input name="kind" type="hidden" value={item.kind} />
            <input name="recordId" type="hidden" value={item.id} />
            <input name="returnDate" type="hidden" value={returnDate ?? ""} />
            <button className="bc-focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700">
              <Trash2 aria-hidden="true" size={18} />
              删除
            </button>
          </form>
        </div>
      </AppDrawer>
    </article>
  );
}
