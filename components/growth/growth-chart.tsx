type GrowthChartPoint = {
  id: string;
  label: string;
  ageDays: number;
  value: number | null;
};

export type GrowthReferenceLine = {
  key: string;
  label: string;
  z: number;
  points: Array<{
    ageDays: number;
    value: number;
  }>;
};

type GrowthChartProps = {
  title: string;
  unit: string;
  emptyText: string;
  points: GrowthChartPoint[];
  referenceLines?: GrowthReferenceLine[];
  maxAgeDays?: number;
};

function formatValue(value: number, unit: string) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`;
}

export function GrowthChart({
  title,
  unit,
  emptyText,
  points,
  referenceLines = [],
  maxAgeDays,
}: GrowthChartProps) {
  const values = points.filter(
    (point): point is GrowthChartPoint & { value: number } =>
      point.value !== null,
  );

  if (values.length === 0 && referenceLines.length === 0) {
    return (
      <div className="bc-card p-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-4 rounded-lg bg-[var(--surface-muted)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">
          {emptyText}
        </p>
      </div>
    );
  }

  const width = 320;
  const height = 176;
  const paddingX = 28;
  const paddingY = 22;
  const referenceValues = referenceLines.flatMap((line) =>
    line.points.map((point) => point.value),
  );
  const allValues = [...values.map((point) => point.value), ...referenceValues];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const maxPointAge = Math.max(
    1,
    ...values.map((point) => point.ageDays),
    ...referenceLines.flatMap((line) =>
      line.points.map((point) => point.ageDays),
    ),
  );
  const xMax = Math.max(1, maxAgeDays ?? maxPointAge);
  const xForAge = (ageDays: number) =>
    paddingX + (Math.min(ageDays, xMax) / xMax) * innerWidth;
  const yForValue = (value: number) =>
    paddingY + ((maxValue - value) / range) * innerHeight;
  const svgPoints = values.map((point) => {
    const x = values.length === 1 ? xForAge(point.ageDays) : xForAge(point.ageDays);
    const y = yForValue(point.value);

    return { ...point, x, y };
  });
  const polyline = svgPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const latest = values[values.length - 1] ?? null;
  const monthTicks = [0, 6, 12, 18, 24, 30, 36].filter(
    (month) => (month * 365.25) / 12 <= xMax,
  );

  return (
    <div className="bc-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            共 {values.length} 次测量
          </p>
        </div>
        <p className="text-right text-lg font-semibold text-[var(--accent-growth-strong)]">
          {latest ? formatValue(latest.value, unit) : "暂无记录"}
        </p>
      </div>
      <svg
        aria-label={title}
        className="mt-4 h-52 w-full overflow-visible"
        preserveAspectRatio="none"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        <line
          stroke="var(--border-soft)"
          strokeWidth="1"
          x1={paddingX}
          x2={width - paddingX}
          y1={height - paddingY}
          y2={height - paddingY}
        />
        <line
          stroke="var(--border-soft)"
          strokeWidth="1"
          x1={paddingX}
          x2={paddingX}
          y1={paddingY}
          y2={height - paddingY}
        />
        {referenceLines.map((line) => {
          const linePoints = line.points
            .map((point) => `${xForAge(point.ageDays)},${yForValue(point.value)}`)
            .join(" ");
          const lastPoint = line.points[line.points.length - 1];

          return (
            <g key={line.key}>
              <polyline
                fill="none"
                points={linePoints}
                stroke="var(--border-soft)"
                strokeDasharray={line.z === 0 ? undefined : "4 4"}
                strokeWidth={line.z === 0 ? "2" : "1.5"}
              />
              {lastPoint ? (
                <text
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="start"
                  x={xForAge(lastPoint.ageDays) + 4}
                  y={yForValue(lastPoint.value) + 3}
                >
                  {line.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {values.length > 1 ? (
          <polyline
            fill="none"
            points={polyline}
            stroke="var(--accent-growth-strong)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        ) : null}
        {svgPoints.map((point) => (
          <g key={point.id}>
            <circle
              cx={point.x}
              cy={point.y}
              fill="var(--surface)"
              r="5"
              stroke="var(--accent-growth-strong)"
              strokeWidth="3"
            />
          </g>
        ))}
        {monthTicks.map((month) => {
          const x = xForAge((month * 365.25) / 12);

          return (
            <g key={month}>
              <line
                stroke="var(--border-soft)"
                strokeWidth="1"
                x1={x}
                x2={x}
                y1={height - paddingY}
                y2={height - paddingY + 4}
              />
              <text
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
                x={x}
                y={height - 4}
              >
                {month}月
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
        <span>{formatValue(minValue, unit)}</span>
        <span>{formatValue(maxValue, unit)}</span>
      </div>
    </div>
  );
}
