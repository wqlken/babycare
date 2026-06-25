export type LocalDayRange = {
  start: Date;
  end: Date;
};

type DateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getDateParts(date: Date, timezone: string): DateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getTimezoneOffsetMs(date: Date, timezone: string) {
  const parts = getDateParts(date, timezone);
  const utcFromLocalParts = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return utcFromLocalParts - date.getTime();
}

function zonedLocalDateTimeToUtc(dateTime: string, timezone: string) {
  const candidate = new Date(`${dateTime}Z`);
  const offset = getTimezoneOffsetMs(candidate, timezone);
  const adjusted = new Date(candidate.getTime() - offset);
  const adjustedOffset = getTimezoneOffsetMs(adjusted, timezone);

  return new Date(candidate.getTime() - adjustedOffset);
}

export function toLocalDateString(date: Date, timezone: string) {
  const parts = getDateParts(date, timezone);
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");

  return `${parts.year}-${month}-${day}`;
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));

  return utc.toISOString().slice(0, 10);
}

export function getLocalDayRange(
  date: string,
  timezone = "Asia/Shanghai",
): LocalDayRange {
  return {
    start: zonedLocalDateTimeToUtc(`${date}T00:00:00.000`, timezone),
    end: zonedLocalDateTimeToUtc(`${addDays(date, 1)}T00:00:00.000`, timezone),
  };
}

export function splitDurationByLocalDay(input: {
  start: Date;
  end: Date;
  timezone?: string;
}) {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const result: Array<{ date: string; minutes: number }> = [];
  let currentDate = toLocalDateString(input.start, timezone);
  const endDate = toLocalDateString(input.end, timezone);

  while (currentDate <= endDate) {
    const range = getLocalDayRange(currentDate, timezone);
    const overlapStart = Math.max(input.start.getTime(), range.start.getTime());
    const overlapEnd = Math.min(input.end.getTime(), range.end.getTime());

    if (overlapEnd > overlapStart) {
      result.push({
        date: currentDate,
        minutes: Math.round((overlapEnd - overlapStart) / 60_000),
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return result;
}

export function formatChildAge(input: { birthday: Date; now?: Date }) {
  const now = input.now ?? new Date();
  const days = Math.max(
    0,
    Math.floor((now.getTime() - input.birthday.getTime()) / 86_400_000),
  );

  if (days < 60) {
    return `${days}天`;
  }

  return `${Math.floor(days / 30)}个月`;
}
