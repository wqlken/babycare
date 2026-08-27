import type { TimelineItem } from "@/lib/timeline";

export type TimelineEditorProps = {
  childId: string;
  item: TimelineItem;
  onCancel: () => void;
  returnDate?: string;
};
