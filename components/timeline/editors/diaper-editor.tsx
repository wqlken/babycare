"use client";

import { useState } from "react";
import { updateDiaperRecordAction } from "@/app/actions/diapers";
import { formatDateTimeLocalInput } from "@/lib/time";
import { TimelineEditorActions } from "@/components/timeline/editors/editor-actions";
import {
  timelineEditorInputClass,
  TimelineEditorField,
} from "@/components/timeline/editors/editor-field";
import type { TimelineEditorProps } from "@/components/timeline/editors/types";

export function DiaperEditor({
  childId,
  item,
  onCancel,
  returnDate,
}: TimelineEditorProps) {
  const [type, setType] = useState(item.diaperType ?? "wet");
  const showStoolFields = type === "dirty" || type === "both";

  return (
    <form
      action={updateDiaperRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="returnDate" type="hidden" value={returnDate ?? ""} />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <TimelineEditorField label="记录时间">
        <input
          className={timelineEditorInputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="eventTime"
          required
          type="datetime-local"
        />
      </TimelineEditorField>
      <TimelineEditorField label="类型">
        <select
          className={timelineEditorInputClass}
          name="type"
          onChange={(event) => setType(event.target.value as typeof type)}
          value={type}
        >
          <option value="wet">尿湿</option>
          <option value="dirty">便便</option>
          <option value="both">尿湿和便便</option>
        </select>
      </TimelineEditorField>
      {showStoolFields ? (
        <>
          <TimelineEditorField label="颜色">
            <select
              className={timelineEditorInputClass}
              defaultValue={item.stoolColor ?? ""}
              name="stoolColor"
            >
              <option value="">未填写</option>
              <option value="yellow">黄色</option>
              <option value="brown">棕色</option>
              <option value="green">绿色</option>
              <option value="black">黑色</option>
              <option value="red">红色</option>
              <option value="white">白色</option>
              <option value="other">其他</option>
              <option value="unknown">不确定</option>
            </select>
          </TimelineEditorField>
          <TimelineEditorField label="质地">
            <select
              className={timelineEditorInputClass}
              defaultValue={item.stoolConsistency ?? ""}
              name="stoolConsistency"
            >
              <option value="">未填写</option>
              <option value="watery">水样</option>
              <option value="loose">偏稀</option>
              <option value="soft">软便</option>
              <option value="formed">成形</option>
              <option value="hard">偏硬</option>
              <option value="mucousy">黏液</option>
              <option value="other">其他</option>
              <option value="unknown">不确定</option>
            </select>
          </TimelineEditorField>
        </>
      ) : null}
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
