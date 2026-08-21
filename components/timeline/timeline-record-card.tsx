"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { deleteRecordAction } from "@/app/actions/records";
import { updateDiaperRecordAction } from "@/app/actions/diapers";
import { updateFeedingRecordAction } from "@/app/actions/feedings";
import { updateSleepRecordAction } from "@/app/actions/sleep";
import { formatDateTimeLocalInput } from "@/lib/time";
import type { TimelineItem } from "@/lib/timeline";

type TimelineRecordCardProps = {
  childId: string;
  item: TimelineItem;
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

function formatItemTime(item: TimelineItem) {
  const start = formatTime(item.displayStartTime);

  if (item.feedingType === "breast" || item.kind === "sleep") {
    if (item.displayEndTime) {
      return `${start}-${formatTime(item.displayEndTime)}`;
    }

    return `${start} 开始`;
  }

  return start;
}

function bottleContentLabel(value?: TimelineItem["bottleContent"]) {
  if (value === "formula") return "配方奶";
  if (value === "expressed_breast_milk") return "母乳瓶喂";
  if (value === "mixed") return "混合";
  if (value === "other") return "其他";
  return "未指定";
}

function diaperTypeLabel(value?: TimelineItem["diaperType"]) {
  if (value === "dirty") return "便便";
  if (value === "both") return "尿湿和便便";
  return "尿湿";
}

function stoolColorLabel(value?: TimelineItem["stoolColor"]) {
  if (value === "yellow") return "黄色";
  if (value === "brown") return "棕色";
  if (value === "green") return "绿色";
  if (value === "black") return "黑色";
  if (value === "red") return "红色";
  if (value === "white") return "白色";
  if (value === "other") return "其他";
  if (value === "unknown") return "不确定";
  return "未填写";
}

function stoolConsistencyLabel(value?: TimelineItem["stoolConsistency"]) {
  if (value === "watery") return "水样";
  if (value === "loose") return "偏稀";
  if (value === "soft") return "软便";
  if (value === "formed") return "成形";
  if (value === "hard") return "偏硬";
  if (value === "mucousy") return "黏液";
  if (value === "other") return "其他";
  if (value === "unknown") return "不确定";
  return "未填写";
}

function getDetailText(item: TimelineItem) {
  if (item.feedingType === "bottle") {
    return bottleContentLabel(item.bottleContent);
  }

  if (item.kind === "diaper") {
    if (item.diaperType === "dirty" || item.diaperType === "both") {
      return `${diaperTypeLabel(item.diaperType)} · ${stoolColorLabel(
        item.stoolColor,
      )} · ${stoolConsistencyLabel(item.stoolConsistency)}`;
    }

    return diaperTypeLabel(item.diaperType);
  }

  return null;
}

function FieldLabel({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm";

function BottleEditor({
  childId,
  item,
  onCancel,
}: TimelineRecordCardProps & { onCancel: () => void }) {
  return (
    <form
      action={updateFeedingRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="type" type="hidden" value="bottle" />
      <input name="milkUnit" type="hidden" value="ml" />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <FieldLabel label="记录时间">
        <input
          className={inputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="startTime"
          required
          type="datetime-local"
        />
      </FieldLabel>
      <FieldLabel label="奶量 ml">
        <input
          className={inputClass}
          defaultValue={item.amountMl ?? ""}
          min={1}
          name="amount"
          required
          type="number"
        />
      </FieldLabel>
      <FieldLabel label="内容">
        <select
          className={inputClass}
          defaultValue={item.bottleContent ?? "unknown"}
          name="bottleContent"
        >
          <option value="unknown">未指定</option>
          <option value="formula">配方奶</option>
          <option value="expressed_breast_milk">母乳瓶喂</option>
          <option value="mixed">混合</option>
          <option value="other">其他</option>
        </select>
      </FieldLabel>
      <FieldLabel label="备注">
        <input
          className={inputClass}
          defaultValue={item.notes ?? ""}
          name="notes"
        />
      </FieldLabel>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function BreastfeedingEditor({
  childId,
  item,
  onCancel,
}: TimelineRecordCardProps & { onCancel: () => void }) {
  return (
    <form
      action={updateFeedingRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="type" type="hidden" value="breast" />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <FieldLabel label="开始时间">
        <input
          className={inputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="startTime"
          required
          type="datetime-local"
        />
      </FieldLabel>
      <FieldLabel label="结束时间">
        <input
          className={inputClass}
          defaultValue={
            item.displayEndTime ? formatDateTimeLocalInput(item.displayEndTime) : ""
          }
          name="endTime"
          type="datetime-local"
        />
      </FieldLabel>
      <FieldLabel label="侧别">
        <select
          className={inputClass}
          defaultValue={item.breastSide ?? "unknown"}
          name="breastSide"
        >
          <option value="unknown">未指定</option>
          <option value="left">左侧</option>
          <option value="right">右侧</option>
          <option value="both">两侧</option>
        </select>
      </FieldLabel>
      <FieldLabel label="备注">
        <input
          className={inputClass}
          defaultValue={item.notes ?? ""}
          name="notes"
        />
      </FieldLabel>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function DiaperEditor({
  childId,
  item,
  onCancel,
}: TimelineRecordCardProps & { onCancel: () => void }) {
  const [type, setType] = useState(item.diaperType ?? "wet");
  const showStoolFields = type === "dirty" || type === "both";

  return (
    <form
      action={updateDiaperRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <FieldLabel label="记录时间">
        <input
          className={inputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="eventTime"
          required
          type="datetime-local"
        />
      </FieldLabel>
      <FieldLabel label="类型">
        <select
          className={inputClass}
          name="type"
          onChange={(event) => setType(event.target.value as typeof type)}
          value={type}
        >
          <option value="wet">尿湿</option>
          <option value="dirty">便便</option>
          <option value="both">尿湿和便便</option>
        </select>
      </FieldLabel>
      {showStoolFields ? (
        <>
          <FieldLabel label="颜色">
            <select
              className={inputClass}
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
          </FieldLabel>
          <FieldLabel label="质地">
            <select
              className={inputClass}
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
          </FieldLabel>
        </>
      ) : null}
      <FieldLabel label="备注">
        <input
          className={inputClass}
          defaultValue={item.notes ?? ""}
          name="notes"
        />
      </FieldLabel>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function SleepEditor({
  childId,
  item,
  onCancel,
}: TimelineRecordCardProps & { onCancel: () => void }) {
  return (
    <form
      action={updateSleepRecordAction}
      className="mt-4 grid gap-3 rounded border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2"
    >
      <input name="childId" type="hidden" value={childId} />
      <input name="recordId" type="hidden" value={item.id} />
      <input name="updatedAt" type="hidden" value={item.updatedAt?.toISOString() ?? ""} />
      <FieldLabel label="开始时间">
        <input
          className={inputClass}
          defaultValue={formatDateTimeLocalInput(item.displayStartTime)}
          name="startTime"
          required
          type="datetime-local"
        />
      </FieldLabel>
      <FieldLabel label="结束时间">
        <input
          className={inputClass}
          defaultValue={
            item.displayEndTime ? formatDateTimeLocalInput(item.displayEndTime) : ""
          }
          name="endTime"
          type="datetime-local"
        />
      </FieldLabel>
      <FieldLabel label="备注">
        <input
          className={inputClass}
          defaultValue={item.notes ?? ""}
          name="notes"
        />
      </FieldLabel>
      <EditorActions onCancel={onCancel} />
    </form>
  );
}

function EditorActions({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex items-end gap-2 sm:col-span-2">
      <button className="rounded bg-slate-950 px-3 py-1.5 text-sm font-medium text-white">
        保存
      </button>
      <button
        className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
        onClick={onCancel}
        type="button"
      >
        取消
      </button>
    </div>
  );
}

function Editor({
  childId,
  item,
  onCancel,
}: TimelineRecordCardProps & { onCancel: () => void }) {
  if (item.feedingType === "bottle") {
    return <BottleEditor childId={childId} item={item} onCancel={onCancel} />;
  }

  if (item.feedingType === "breast") {
    return (
      <BreastfeedingEditor childId={childId} item={item} onCancel={onCancel} />
    );
  }

  if (item.kind === "diaper") {
    return <DiaperEditor childId={childId} item={item} onCancel={onCancel} />;
  }

  return <SleepEditor childId={childId} item={item} onCancel={onCancel} />;
}

export function TimelineRecordCard({ childId, item }: TimelineRecordCardProps) {
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
          <button className="rounded border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">
            删除
          </button>
        </form>
      </div>
      {editing ? (
        <Editor childId={childId} item={item} onCancel={() => setEditing(false)} />
      ) : null}
    </article>
  );
}
