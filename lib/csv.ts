type ExportKind = "feeding" | "diaper" | "sleep";

export type ExportCsvRow = {
  kind: ExportKind;
  recordId: string;
  childId: string;
  eventTime: Date;
  startTime?: Date | null;
  endTime?: Date | null;
  creatorDisplayName: string;
  feedingType?: "breast" | "bottle" | null;
  breastSide?: "left" | "right" | "both" | "unknown" | null;
  amountMl?: number | null;
  diaperType?: "wet" | "dirty" | "both" | null;
  notes?: string | null;
};

const CSV_HEADERS = [
  "kind",
  "recordId",
  "childId",
  "eventTimeUtc",
  "eventTimeLocal",
  "startTimeUtc",
  "endTimeUtc",
  "creatorDisplayName",
  "feedingType",
  "breastSide",
  "amountMl",
  "diaperType",
  "notes",
];

function formatLocalMinute(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")} ${value("hour")}:${value("minute")}`;
}

function csvCell(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";

  const text = String(value);
  if (!/[",\r\n]/.test(text)) return text;

  return `"${text.replaceAll('"', '""')}"`;
}

function iso(date?: Date | null) {
  return date ? date.toISOString() : "";
}

export function serializeRecordsCsv(input: {
  timezone: string;
  rows: ExportCsvRow[];
}) {
  const lines = [
    CSV_HEADERS.join(","),
    ...input.rows.map((row) =>
      [
        row.kind,
        row.recordId,
        row.childId,
        row.eventTime.toISOString(),
        formatLocalMinute(row.eventTime, input.timezone),
        iso(row.startTime),
        iso(row.endTime),
        row.creatorDisplayName,
        row.feedingType,
        row.breastSide,
        row.amountMl,
        row.diaperType,
        row.notes,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  return lines.join("\r\n");
}
