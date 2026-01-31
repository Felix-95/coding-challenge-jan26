"use client";

/**
 * Matches Over Time Chart
 * 
 * Displays satisfaction scores over match sequence (by match number).
 * Shows separate lines for Apple and Orange satisfaction.
 */

interface MatchesOverTimeChartProps {
  matches: Array<{
    scoreAppleOnOrange: number;
    scoreOrangeOnApple: number;
    createdAt: string;
  }>;
}

export function MatchesOverTimeChart({ matches }: MatchesOverTimeChartProps) {
  // Empty state
  if (matches.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center text-white/50">
        <div className="text-center">
          <p className="text-sm">No best matches yet</p>
          <p className="mt-1 text-xs text-white/30">
            Create matches to see trends
          </p>
        </div>
      </div>
    );
  }

  // Sort matches by creation time to get sequence
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Chart dimensions
  const chartHeight = 280;
  const chartWidth = 1200;
  const padding = { top: 20, right: 40, bottom: 50, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scale for X-axis (match number)
  const maxMatchNumber = sortedMatches.length;
  const xScale = (matchIndex: number) =>
    padding.left + (matchIndex / (maxMatchNumber - 1 || 1)) * plotWidth;

  // Y-axis is 0-100% (0-1 as decimal)
  const yScale = (score: number) =>
    padding.top + plotHeight - score * plotHeight;

  // Generate path for Apple satisfaction line
  const appleLinePath = sortedMatches
    .map((match, i) => {
      const x = xScale(i);
      const y = yScale(match.scoreAppleOnOrange);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  // Generate path for Orange satisfaction line
  const orangeLinePath = sortedMatches
    .map((match, i) => {
      const x = xScale(i);
      const y = yScale(match.scoreOrangeOnApple);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-5 rounded bg-red-500" />
          <span className="text-white/70">Apple</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-5 rounded bg-orange-500" />
          <span className="text-white/70">Orange</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative overflow-x-auto">
        <svg
          width="100%"
          height={chartHeight + 20}
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
          preserveAspectRatio="xMinYMin meet"
          className="overflow-visible"
        >
          {/* Y-axis grid lines and labels (0-100%) */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
            const y = yScale(ratio);
            return (
              <g key={ratio}>
                {/* Grid line */}
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? "0" : "4 4"}
                />
                {/* Y-axis label */}
                <text
                  x={padding.left - 15}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-white/50"
                  fontSize="12"
                >
                  {Math.round(ratio * 100)}%
                </text>
              </g>
            );
          })}

          {/* X-axis grid lines and labels (match numbers) */}
          {sortedMatches.map((_, i) => {
            // Show every Nth label to avoid crowding
            const labelInterval = Math.max(1, Math.ceil(maxMatchNumber / 10));
            const showLabel = i % labelInterval === 0 || i === maxMatchNumber - 1;
            const x = xScale(i);

            return (
              <g key={i}>
                {/* Vertical grid line (light) */}
                {showLabel && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={chartHeight - padding.bottom}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                  />
                )}
                {/* X-axis label */}
                {showLabel && (
                  <text
                    x={x}
                    y={chartHeight - padding.bottom + 20}
                    textAnchor="middle"
                    className="fill-white/50"
                    fontSize="11"
                  >
                    {i + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Apple satisfaction line (red) */}
          <path
            d={appleLinePath}
            fill="none"
            stroke="rgb(239, 68, 68)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Apple data points */}
          {sortedMatches.map((match, i) => (
            <circle
              key={`apple-${i}`}
              cx={xScale(i)}
              cy={yScale(match.scoreAppleOnOrange)}
              r="4"
              className="fill-red-500 stroke-white/20"
              strokeWidth="1"
            >
              <title>{`Match #${i + 1}: ${(match.scoreAppleOnOrange * 100).toFixed(1)}% Apple satisfaction`}</title>
            </circle>
          ))}

          {/* Orange satisfaction line (orange) */}
          <path
            d={orangeLinePath}
            fill="none"
            stroke="rgb(249, 115, 22)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Orange data points */}
          {sortedMatches.map((match, i) => (
            <circle
              key={`orange-${i}`}
              cx={xScale(i)}
              cy={yScale(match.scoreOrangeOnApple)}
              r="4"
              className="fill-orange-500 stroke-white/20"
              strokeWidth="1"
            >
              <title>{`Match #${i + 1}: ${(match.scoreOrangeOnApple * 100).toFixed(1)}% Orange satisfaction`}</title>
            </circle>
          ))}

          {/* X-axis label */}
          <text
            x={padding.left + plotWidth / 2}
            y={chartHeight - padding.bottom + 35}
            textAnchor="middle"
            className="fill-white/40"
            fontSize="10"
          >
            Match Number
          </text>

          {/* Y-axis label */}
          <text
            x={padding.left - 35}
            y={padding.top + plotHeight / 2}
            textAnchor="middle"
            className="fill-white/40"
            fontSize="10"
            transform={`rotate(-90, ${padding.left - 35}, ${padding.top + plotHeight / 2})`}
          >
            Satisfaction
          </text>
        </svg>
      </div>
    </div>
  );
}
