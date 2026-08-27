type GrowthChartPoint = {
  id: string;
  label: string;
  value: number | null;
};

type GrowthChartProps = {
  title: string;
  unit: string;
  emptyText: string;
  points: GrowthChartPoint[];
};

function formatValue(value: number, unit: string) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`;
}

export function GrowthChart({
  title,
  unit,
  emptyText,
  points,
}: GrowthChartProps) {
  const values = points.filter(
    (point): point is GrowthChartPoint & { value: number } =>
      point.value !== null,
  );

  if (values.length === 0) {
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
  const minValue = Math.min(...values.map((point) => point.value));
  const maxValue = Math.max(...values.map((point) => point.value));
  const range = maxValue - minValue || 1;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;
  const svgPoints = values.map((point, index) => {
    const x =
      values.length === 1
        ? width / 2
        : paddingX + (innerWidth / (values.length - 1)) * index;
    const y = paddingY + ((maxValue - point.value) / range) * innerHeight;

    return { ...point, x, y };
  });
  const polyline = svgPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const latest = values[values.length - 1];

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
          {formatValue(latest.value, unit)}
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
            <text
              fill="var(--text-muted)"
              fontSize="10"
              textAnchor="middle"
              x={point.x}
              y={height - 4}
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-[var(--text-muted)]">
        <span>{formatValue(minValue, unit)}</span>
        <span>{formatValue(maxValue, unit)}</span>
      </div>
    </div>
  );
}
