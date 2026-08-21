import type { DayRhythm } from "@/lib/day-rhythm";

type DayRhythmChartProps = {
  rhythm: DayRhythm;
};

function markerTitle(marker: DayRhythm["markers"][number]) {
  return `${marker.label}${marker.value ? ` ${marker.value}` : ""}`;
}

function markerStyle(percent: number) {
  const safePercent = Math.min(100, Math.max(0, percent));
  let transform = "translateX(-50%)";

  if (safePercent <= 3) {
    transform = "translateX(0)";
  } else if (safePercent >= 97) {
    transform = "translateX(-100%)";
  }

  return {
    left: `${safePercent}%`,
    transform,
  };
}

export function DayRhythmChart({ rhythm }: DayRhythmChartProps) {
  const hasRecords =
    rhythm.sleepSegments.length > 0 || rhythm.markers.length > 0;
  const details = [
    ...rhythm.sleepSegments.map((segment) => ({
      id: `sleep-${segment.id}`,
      label: segment.label,
      percent: segment.startPercent,
    })),
    ...rhythm.markers.map((marker) => ({
      id: `marker-${marker.id}`,
      label: `${marker.label}${marker.value ? ` · ${marker.value}` : ""}`,
      percent: marker.percent,
    })),
  ].sort((left, right) => left.percent - right.percent);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          今日节奏
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          睡眠、喂养和尿布记录按 24 小时排列。
        </p>
      </div>
      <div className="bc-card overflow-visible p-4">
        <div className="relative min-h-32 rounded-lg bg-[var(--surface-muted)] p-3">
          <div className="absolute inset-x-3 top-1/2 h-px bg-[var(--border-soft)]" />
          {rhythm.sleepSegments.map((segment) => (
            <div
              aria-label={segment.label}
              className="absolute top-5 h-8 rounded-full bg-[var(--accent-sleep)]"
              key={segment.id}
              role="img"
              style={{
                left: `${segment.startPercent}%`,
                width: `${segment.widthPercent}%`,
              }}
              title={segment.label}
            />
          ))}
          {rhythm.markers.map((marker) => (
            <div
              className="absolute top-16 text-center"
              key={marker.id}
              style={markerStyle(marker.percent)}
            >
              <div
                aria-label={markerTitle(marker)}
                className={`mx-auto h-4 w-4 rounded-full border-2 border-[var(--surface)] ${
                  marker.kind === "feeding"
                    ? "bg-[var(--accent-feeding)]"
                    : "bg-[var(--accent-diaper)]"
                }`}
                role="img"
                title={markerTitle(marker)}
              />
              {marker.value ? (
                <p className="mt-1 whitespace-nowrap text-[10px] text-[var(--text-muted)]">
                  {marker.value}
                </p>
              ) : null}
            </div>
          ))}
          <div className="absolute inset-x-3 bottom-2 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
        {hasRecords ? (
          <ul className="mt-4 space-y-1 text-sm text-[var(--text-muted)]">
            {details.map((detail) => (
              <li key={detail.id}>{detail.label}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            今天还没有睡眠、喂养或尿布记录。
          </p>
        )}
      </div>
    </section>
  );
}
