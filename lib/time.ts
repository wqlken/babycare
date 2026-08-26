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

function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function toLocalDateString(date: Date, timezone: string) {
  const parts = getDateParts(date, timezone);
  const month = padDatePart(parts.month);
  const day = padDatePart(parts.day);

  return `${parts.year}-${month}-${day}`;
}

export function formatDateTimeLocalInput(
  date: Date,
  timezone = "Asia/Shanghai",
) {
  const parts = getDateParts(date, timezone);

  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(
    parts.day,
  )}T${padDatePart(parts.hour)}:${padDatePart(parts.minute)}`;
}

export function parseRecordDateTimeInput(
  value: string,
  options?: {
    timezone?: string;
    now?: Date;
  },
) {
  const timezone = options?.timezone ?? "Asia/Shanghai";
  const now = options?.now ?? new Date();

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/,
  );
  if (!match) {
    throw new Error("记录时间无效。");
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > new Date(Date.UTC(year, month, 0)).getUTCDate() ||
    hour > 23 ||
    minute > 59
  ) {
    throw new Error("记录时间无效。");
  }

  const parsed = zonedLocalDateTimeToUtc(value, timezone);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("记录时间无效。");
  }

  if (parsed.getTime() > now.getTime() + 5 * 60_000) {
    throw new Error("记录时间不能晚于当前时间。");
  }

  return parsed;
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

type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

function compareDateOnly(left: DateOnlyParts, right: DateOnlyParts) {
  if (left.year !== right.year) return left.year - right.year;
  if (left.month !== right.month) return left.month - right.month;
  return left.day - right.day;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addCalendarMonths(date: DateOnlyParts, months: number): DateOnlyParts {
  const monthIndex = date.month - 1 + months;
  const year = date.year + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  const day = Math.min(date.day, daysInMonth(year, month));

  return { year, month, day };
}

function daysBetweenDates(start: DateOnlyParts, end: DateOnlyParts) {
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);

  return Math.max(0, Math.round((endUtc - startUtc) / 86_400_000));
}

function toDateOnlyParts(date: Date, timezone: string): DateOnlyParts {
  const parts = getDateParts(date, timezone);

  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
}

export function formatChildAge(input: {
  birthday: Date;
  now?: Date;
  timezone?: string;
}) {
  const timezone = input.timezone ?? "Asia/Shanghai";
  const now = input.now ?? new Date();
  const birthday = toDateOnlyParts(input.birthday, timezone);
  const today = toDateOnlyParts(now, timezone);

  if (compareDateOnly(today, birthday) <= 0) {
    return "今天出生";
  }

  let months =
    (today.year - birthday.year) * 12 + (today.month - birthday.month);
  let anchor = addCalendarMonths(birthday, months);

  if (compareDateOnly(anchor, today) > 0) {
    months -= 1;
    anchor = addCalendarMonths(birthday, months);
  }

  const days = daysBetweenDates(anchor, today);

  if (months === 0) {
    return `${days}天`;
  }

  if (months < 24) {
    return days > 0 ? `${months}个月${days}天` : `${months}个月`;
  }

  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  return restMonths > 0 ? `${years}岁${restMonths}个月` : `${years}岁`;
}
