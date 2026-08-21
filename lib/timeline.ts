export type TimelineItem = {
  id: string;
  kind: "feeding" | "diaper" | "sleep";
  title: string;
  time: Date;
  displayStartTime: Date;
  displayEndTime?: Date | null;
  feedingType?: "breast" | "bottle";
  breastSide?: "left" | "right" | "both" | "unknown" | null;
  bottleContent?: "formula" | "expressed_breast_milk" | "mixed" | "other" | "unknown" | null;
  diaperType?: "wet" | "dirty" | "both";
  stoolColor?: "yellow" | "brown" | "green" | "black" | "red" | "white" | "other" | "unknown" | null;
  stoolConsistency?: "watery" | "loose" | "soft" | "formed" | "hard" | "mucousy" | "other" | "unknown" | null;
  creatorDisplayName: string;
  notes: string | null;
  updatedAt?: Date;
  edited?: boolean;
  amountMl?: number | null;
};

type FeedingInput = {
  id: string;
  type: "breast" | "bottle";
  breastSide: "left" | "right" | "both" | "unknown" | null;
  startTime: Date;
  endTime: Date | null;
  amountMl: number | null;
  bottleContent?: "formula" | "expressed_breast_milk" | "mixed" | "other" | "unknown" | null;
  creatorDisplayName: string;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type DiaperInput = {
  id: string;
  type: "wet" | "dirty" | "both";
  stoolColor?: "yellow" | "brown" | "green" | "black" | "red" | "white" | "other" | "unknown" | null;
  stoolConsistency?: "watery" | "loose" | "soft" | "formed" | "hard" | "mucousy" | "other" | "unknown" | null;
  time: Date;
  creatorDisplayName: string;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type SleepInput = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  creatorDisplayName: string;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

function isEdited(record: { createdAt?: Date; updatedAt?: Date }) {
  if (!record.createdAt || !record.updatedAt) return false;
  return record.updatedAt.getTime() > record.createdAt.getTime();
}

function diaperTitle(type: DiaperInput["type"]) {
  if (type === "dirty") return "便便";
  if (type === "both") return "尿湿和便便";
  return "尿湿";
}

function breastSideLabel(side: FeedingInput["breastSide"]) {
  if (side === "left") return "左侧";
  if (side === "right") return "右侧";
  if (side === "both") return "两侧";
  return "";
}

function feedingTitle(feeding: FeedingInput) {
  if (feeding.type === "bottle") {
    return `瓶喂 ${feeding.amountMl ?? 0} ml`;
  }

  const side = breastSideLabel(feeding.breastSide);
  return side ? `母乳 ${side}` : "母乳";
}

export function buildTimelineItems(input: {
  feedings: FeedingInput[];
  diapers: DiaperInput[];
  sleeps: SleepInput[];
}): TimelineItem[] {
  return [
    ...input.feedings.map((feeding) => ({
      id: feeding.id,
      kind: "feeding" as const,
      title: feedingTitle(feeding),
      time: feeding.endTime ?? feeding.startTime,
      displayStartTime: feeding.startTime,
      displayEndTime: feeding.type === "breast" ? feeding.endTime : undefined,
      feedingType: feeding.type,
      breastSide: feeding.breastSide,
      bottleContent: feeding.bottleContent,
      creatorDisplayName: feeding.creatorDisplayName,
      notes: feeding.notes,
      updatedAt: feeding.updatedAt,
      edited: isEdited(feeding),
      amountMl: feeding.amountMl,
    })),
    ...input.diapers.map((diaper) => ({
      id: diaper.id,
      kind: "diaper" as const,
      title: diaperTitle(diaper.type),
      time: diaper.time,
      displayStartTime: diaper.time,
      diaperType: diaper.type,
      stoolColor: diaper.stoolColor,
      stoolConsistency: diaper.stoolConsistency,
      creatorDisplayName: diaper.creatorDisplayName,
      notes: diaper.notes,
      updatedAt: diaper.updatedAt,
      edited: isEdited(diaper),
    })),
    ...input.sleeps.map((sleep) => ({
      id: sleep.id,
      kind: "sleep" as const,
      title: sleep.endTime ? "睡眠" : "睡眠中",
      time: sleep.endTime ?? sleep.startTime,
      displayStartTime: sleep.startTime,
      displayEndTime: sleep.endTime,
      creatorDisplayName: sleep.creatorDisplayName,
      notes: sleep.notes,
      updatedAt: sleep.updatedAt,
      edited: isEdited(sleep),
    })),
  ].sort((left, right) => right.time.getTime() - left.time.getTime());
}
