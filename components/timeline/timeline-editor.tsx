"use client";

import { BottleEditor } from "@/components/timeline/editors/bottle-editor";
import { BreastfeedingEditor } from "@/components/timeline/editors/breastfeeding-editor";
import { DiaperEditor } from "@/components/timeline/editors/diaper-editor";
import { SleepEditor } from "@/components/timeline/editors/sleep-editor";
import type { TimelineEditorProps } from "@/components/timeline/editors/types";

export function TimelineEditor(props: TimelineEditorProps) {
  if (props.item.feedingType === "bottle") {
    return <BottleEditor {...props} />;
  }

  if (props.item.feedingType === "breast") {
    return <BreastfeedingEditor {...props} />;
  }

  if (props.item.kind === "diaper") {
    return <DiaperEditor {...props} />;
  }

  return <SleepEditor {...props} />;
}
