"use client";

import { useState } from "react";
import { deleteRecordAction } from "@/app/actions/records";
import { TimelineEditor } from "@/components/timeline/timeline-editor";
import { formatItemTime, getDetailText } from "@/components/timeline/timeline-formatters";
import type { TimelineItem } from "@/lib/timeline";

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
  const detailText = getDetailText(item);

  return (
    <article className="rounded border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium text-slate-950">{item.title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {item.creatorDisplayName}
            {item.edited ? " · 已编辑" : ""}
          </p>
          {detailText ? (
            <p className="mt-1 text-sm text-slate-500">{detailText}</p>
          ) : null}
        </div>
        <time className="shrink-0 text-right text-sm text-slate-500">
          {formatItemTime(item)}
        </time>
      </div>
      {item.notes ? (
        <p className="mt-3 text-sm text-slate-700">{item.notes}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <button
          className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
          onClick={() => setEditing((current) => !current)}
          type="button"
        >
          {editing ? "收起" : "编辑"}
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
          <button className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">
            删除
          </button>
        </form>
      </div>
      {editing ? (
        <TimelineEditor
          childId={childId}
          item={item}
          onCancel={() => setEditing(false)}
          returnDate={returnDate}
        />
      ) : null}
    </article>
  );
}
