"use client";

import { updateFeedingRecordAction } from "@/app/actions/feedings";
import { formatDateTimeLocalInput } from "@/lib/time";
import { TimelineEditorActions } from "@/components/timeline/editors/editor-actions";
import {
  timelineEditorInputClass,
  TimelineEditorField,
} from "@/components/timeline/editors/editor-field";
import type { TimelineEditorProps } from "@/components/timeline/editors/types";

export function BottleEditor({
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
      <input name="type" type="hidden" value="bottle" />
      <input name="milkUnit" type="hidden" value="ml" />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <TimelineEditorField label="记录时间">
        <input
          className={timelineEditorInputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="startTime"
          required
          type="datetime-local"
        />
      </TimelineEditorField>
      <TimelineEditorField label="奶量 ml">
        <input
          className={timelineEditorInputClass}
          defaultValue={item.amountMl ?? ""}
          min={1}
          name="amount"
          required
          type="number"
        />
      </TimelineEditorField>
      <TimelineEditorField label="内容">
        <select
          className={timelineEditorInputClass}
          defaultValue={item.bottleContent ?? "unknown"}
          name="bottleContent"
        >
          <option value="unknown">未指定</option>
          <option value="formula">配方奶</option>
          <option value="expressed_breast_milk">母乳瓶喂</option>
          <option value="mixed">混合</option>
          <option value="other">其他</option>
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
