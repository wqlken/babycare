"use client";

import { updateSleepRecordAction } from "@/app/actions/sleep";
import { formatDateTimeLocalInput } from "@/lib/time";
import { TimelineEditorActions } from "@/components/timeline/editors/editor-actions";
import {
  timelineEditorInputClass,
  TimelineEditorField,
} from "@/components/timeline/editors/editor-field";
import type { TimelineEditorProps } from "@/components/timeline/editors/types";

export function SleepEditor({
  childId,
  item,
  onCancel,
  returnDate,
}: TimelineEditorProps) {
  return (
    <form
      action={updateSleepRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="returnDate" type="hidden" value={returnDate ?? ""} />
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
