"use client";

export function TimelineEditorActions({ onCancel }: { onCancel: () => void }) {
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
