export type TimelineItem = {
  id: string;
  kind: "feeding" | "diaper" | "sleep";
  title: string;
  time: Date;
  creatorDisplayName: string;
  notes: string | null;
  amountMl?: number | null;
};

type FeedingInput = {
  id: string;
  type: "breast" | "bottle";
  breastSide: "left" | "right" | "both" | "unknown" | null;
  startTime: Date;
  endTime: Date | null;
  amountMl: number | null;
  creatorDisplayName: string;
  notes: string | null;
};

type DiaperInput = {
  id: string;
  type: "wet" | "dirty" | "both";
  time: Date;
  creatorDisplayName: string;
  notes: string | null;
};

type SleepInput = {
  id: string;
  startTime: Date;
  endTime: Date | null;
  creatorDisplayName: string;
  notes: string | null;
};

function diaperTitle(type: DiaperInput["type"]) {
  if (type === "dirty") return "便便";
  if (type === "both") return "尿湿和便便";
  return "尿湿";
}

function feedingTitle(feeding: FeedingInput) {
  if (feeding.type === "bottle") {
    return `瓶喂 ${feeding.amountMl ?? 0} ml`;
  }

  return `母乳 ${feeding.breastSide ?? "unknown"}`;
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
      creatorDisplayName: feeding.creatorDisplayName,
      notes: feeding.notes,
      amountMl: feeding.amountMl,
    })),
    ...input.diapers.map((diaper) => ({
      id: diaper.id,
      kind: "diaper" as const,
      title: diaperTitle(diaper.type),
      time: diaper.time,
      creatorDisplayName: diaper.creatorDisplayName,
      notes: diaper.notes,
    })),
    ...input.sleeps.map((sleep) => ({
      id: sleep.id,
      kind: "sleep" as const,
      title: sleep.endTime ? "睡眠" : "睡眠中",
      time: sleep.endTime ?? sleep.startTime,
      creatorDisplayName: sleep.creatorDisplayName,
      notes: sleep.notes,
    })),
  ].sort((left, right) => right.time.getTime() - left.time.getTime());
}
