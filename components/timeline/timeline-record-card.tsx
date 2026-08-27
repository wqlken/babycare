"use client";

import { useState } from "react";
import { deleteRecordAction } from "@/app/actions/records";
import { TimelineEditor } from "@/components/timeline/timeline-editor";
import {
  formatItemTime,
  getDetailText,
} from "@/components/timeline/timeline-formatters";
import type { TimelineItem } from "@/lib/timeline";
import { MoreHorizontal } from "lucide-react";

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
  const [editing, setEditing] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
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
          aria-expanded={actionsOpen}
          aria-label="记录操作"
          className="bc-focus-ring flex size-10 items-center justify-center rounded-lg border border-[var(--border-soft)] text-[var(--text-muted)]"
          onClick={() => setActionsOpen((current) => !current)}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" size={20} />
        </button>
      </div>
      {actionsOpen ? (
        <div className="mt-3 flex flex-wrap gap-2 pl-0 sm:pl-[5.5rem]">
          <button
            className="bc-focus-ring rounded-lg border border-[var(--border-soft)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)]"
            onClick={() => setEditing((current) => !current)}
            type="button"
          >
            {editing ? "收起编辑" : "编辑"}
          </button>
          <form
            action={deleteRecordAction}
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
            <button className="bc-focus-ring rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">
              删除
            </button>
          </form>
        </div>
      ) : null}
      {editing ? (
        <div className="sm:pl-[5.5rem]">
          <TimelineEditor
            childId={childId}
            item={item}
            onCancel={() => setEditing(false)}
            returnDate={returnDate}
          />
        </div>
      ) : null}
    </article>
  );
}
