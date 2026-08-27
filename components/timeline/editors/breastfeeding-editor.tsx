"use client";

import { updateFeedingRecordAction } from "@/app/actions/feedings";
import { formatDateTimeLocalInput } from "@/lib/time";
import { TimelineEditorActions } from "@/components/timeline/editors/editor-actions";
import {
  timelineEditorInputClass,
  TimelineEditorField,
} from "@/components/timeline/editors/editor-field";
import type { TimelineEditorProps } from "@/components/timeline/editors/types";

export function BreastfeedingEditor({
  childId,
  item,
  onCancel,
  returnDate,
}: TimelineEditorProps) {
  return (
    <form
      action={updateFeedingRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="returnDate" type="hidden" value={returnDate ?? ""} />
      <input name="type" type="hidden" value="breast" />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <TimelineEditorField label="开始时间">
        <input
          className={timelineEditorInputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="startTime"
          required
          type="datetime-local"
        />
      </TimelineEditorField>
      <TimelineEditorField label="结束时间">
        <input
          className={timelineEditorInputClass}
          defaultValue={
            item.displayEndTime ? formatDateTimeLocalInput(item.displayEndTime) : ""
          }
          name="endTime"
          type="datetime-local"
        />
      </TimelineEditorField>
      <TimelineEditorField label="侧别">
        <select
          className={timelineEditorInputClass}
          defaultValue={item.breastSide ?? "unknown"}
          name="breastSide"
        >
          <option value="unknown">未指定</option>
          <option value="left">左侧</option>
          <option value="right">右侧</option>
          <option value="both">两侧</option>
        </select>
      </TimelineEditorField>
      <TimelineEditorField label="备注">
        <input
          className={timelineEditorInputClass}
          defaultValue={item.notes ?? ""}
          name="notes"
        />
      </TimelineEditorField>
      <TimelineEditorActions onCancel={onCancel} />
    </form>
  );
}
