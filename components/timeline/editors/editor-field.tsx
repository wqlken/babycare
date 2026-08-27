import type { ReactNode } from "react";

export const timelineEditorInputClass =
  "mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm";

export function TimelineEditorField({
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
