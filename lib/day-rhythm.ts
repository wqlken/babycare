import { getLocalDayRange } from "@/lib/time";

export type RhythmSleepSegment = {
  id: string;
  startPercent: number;
  widthPercent: number;
  label: string;
};

export type RhythmMarker = {
  id: string;
  percent: number;
  label: string;
  kind: "feeding" | "diaper";
  value?: string;
};

export type DayRhythm = {
  date: string;
  sleepSegments: RhythmSleepSegment[];
  markers: RhythmMarker[];
};

type DateParts = {
  hour: number;
  minute: number;
};

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

function getParts(date: Date, timezone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function formatTime(date: Date, timezone: string) {
  const parts = getParts(date, timezone);
  return `${String(parts.hour).padStart(2, "0")}:${String(
    parts.minute,
  ).padStart(2, "0")}`;
}

function percentOfDay(date: Date, rangeStart: Date) {
  return roundPercent(
    ((date.getTime() - rangeStart.getTime()) / 86_400_000) * 100,
  );
}

function diaperLabel(type: "wet" | "dirty" | "both") {
  if (type === "wet") return "尿湿";
  if (type === "dirty") return "便便";
  return "都有";
}

function feedingLabel(feeding: {
  type: "breast" | "bottle";
  startTime: Date;
  endTime?: Date | null;
}, timezone: string) {
  const start = formatTime(feeding.startTime, timezone);

  if (feeding.type === "bottle") {
    return `${start} 瓶喂`;
  }

  if (feeding.endTime) {
    return `${start}-${formatTime(feeding.endTime, timezone)} 母乳`;
  }

  return `${start} 开始 母乳`;
}

function formatDuration(minutes: number) {
  if (minutes < 1) return "不足1分钟";

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest}分钟`;
  return rest ? `${hours}小时${rest}分钟` : `${hours}小时`;
}

function feedingValue(feeding: {
  type: "breast" | "bottle";
  startTime: Date;
  endTime?: Date | null;
  amountMl?: number | null;
}) {
  if (feeding.type === "bottle") {
    return feeding.amountMl ? `${feeding.amountMl} ml` : undefined;
  }

  if (!feeding.endTime) {
    return "进行中";
  }

  const minutes = Math.floor(
    Math.max(0, feeding.endTime.getTime() - feeding.startTime.getTime()) /
      60_000,
  );

  return formatDuration(minutes);
}

export function buildDayRhythm(input: {
  date: string;
  timezone?: string;
  feedings: Array<{
    id: string;
    type: "breast" | "bottle";
    startTime: Date;
    endTime?: Date | null;
    amountMl?: number | null;
  }>;
  diapers: Array<{
    id: string;
    time: Date;
    type: "wet" | "dirty" | "both";
  }>;
  sleeps: Array<{
    id: string;
    startTime: Date;
    endTime?: Date | null;
  }>;
}): DayRhythm {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const range = getLocalDayRange(input.date, timezone);
  const markers: RhythmMarker[] = [];

  for (const feeding of input.feedings) {
    if (feeding.startTime < range.start || feeding.startTime >= range.end) {
      continue;
    }

    markers.push({
      id: feeding.id,
      percent: percentOfDay(feeding.startTime, range.start),
      label: feedingLabel(feeding, timezone),
      kind: "feeding",
      value: feedingValue(feeding),
    });
  }

  for (const diaper of input.diapers) {
    if (diaper.time < range.start || diaper.time >= range.end) {
      continue;
    }

    markers.push({
      id: diaper.id,
      percent: percentOfDay(diaper.time, range.start),
      label: `${formatTime(diaper.time, timezone)} ${diaperLabel(diaper.type)}`,
      kind: "diaper",
    });
  }

  const sleepSegments = input.sleeps
    .map((sleep) => {
      const endTime = sleep.endTime ?? new Date();
      const start = new Date(
        Math.max(sleep.startTime.getTime(), range.start.getTime()),
      );
      const end = new Date(Math.min(endTime.getTime(), range.end.getTime()));

      if (end <= start) return null;

      return {
        id: sleep.id,
        startPercent: percentOfDay(start, range.start),
        widthPercent: roundPercent(
          ((end.getTime() - start.getTime()) / 86_400_000) * 100,
        ),
        label: `睡眠 ${formatTime(start, timezone)}-${formatTime(
          end,
          timezone,
        )}`,
      };
    })
    .filter((segment): segment is RhythmSleepSegment => Boolean(segment));

  return {
    date: input.date,
    sleepSegments,
    markers: markers.sort((left, right) => left.percent - right.percent),
  };
}
