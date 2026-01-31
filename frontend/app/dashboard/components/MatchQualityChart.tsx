"use client";

/**
 * Match Quality Distribution Chart
 * 
 * Displays a grouped histogram showing the distribution of match quality scores
 * for best matches only. Separates Apple preferences vs Orange preferences.
 */

interface MatchQualityChartProps {
  matches: Array<{
    scoreAppleOnOrange: number;
    scoreOrangeOnApple: number;
  }>;
}

interface Bucket {
  min: number;
  max: number;
  label: string;
  appleCount: number;
  orangeCount: number;
}

export function MatchQualityChart({ matches }: MatchQualityChartProps) {
  // Create 100 buckets (1% intervals: 0-1%, 1-2%, ..., 99-100%)
  const numBuckets = 100;
  const bucketSize = 1 / numBuckets; // 0.01 (1%)
  
  const buckets: Bucket[] = Array.from({ length: numBuckets }, (_, i) => {
    const min = i * bucketSize;
    const max = (i + 1) * bucketSize;
    return {
      min,
      max,
      label: `${Math.round(min * 100)}-${Math.round(max * 100)}%`,
      appleCount: 0,
      orangeCount: 0,
    };
  });

  // Populate buckets with match data
  matches.forEach((match) => {
    // Apple score (apple's prefs vs orange's attrs)
    const appleBucketIndex = Math.min(
      Math.floor(match.scoreAppleOnOrange / bucketSize),
      numBuckets - 1
    );
    buckets[appleBucketIndex].appleCount++;

    // Orange score (orange's prefs vs apple's attrs)
    const orangeBucketIndex = Math.min(
      Math.floor(match.scoreOrangeOnApple / bucketSize),
      numBuckets - 1
    );
    buckets[orangeBucketIndex].orangeCount++;
  });

  // Find max count for scaling (add 10% padding for visual comfort)
  const maxCount = Math.max(
    ...buckets.map((b) => Math.max(b.appleCount, b.orangeCount)),
    1
  );
  const scaledMaxCount = Math.ceil(maxCount * 1.1);

  // Chart dimensions
  const chartHeight = 280;

  // Empty state
  if (matches.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center text-white/50">
        <div className="text-center">
          <p className="text-sm">No best matches yet</p>
          <p className="mt-1 text-xs text-white/30">
            Create matches to see distribution
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-500" />
          <span className="text-white/70">Apple</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-sm bg-orange-500" />
          <span className="text-white/70">Orange</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative overflow-x-auto">
        <svg
          width="100%"
          height={chartHeight + 50}
          className="overflow-visible"
          viewBox={`-40 0 1200 ${chartHeight + 50}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {/* Y-axis grid lines and labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
            const y = chartHeight - ratio * chartHeight;
            const count = Math.round(scaledMaxCount * ratio);
            return (
              <g key={ratio}>
                {/* Grid line */}
                <line
                  x1="0"
                  y1={y}
                  x2="1150"
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                  strokeDasharray={ratio === 0 ? "0" : "4 4"}
                />
                {/* Y-axis label */}
                <text
                  x="-10"
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-white/50 text-xs"
                  fontSize="12"
                >
                  {count}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {buckets.map((bucket, i) => {
            const xBase = i * (1150 / numBuckets);
            const barWidthPx = (1150 / numBuckets) * 0.38;
            const gapPx = (1150 / numBuckets) * 0.04;
            const appleHeight = (bucket.appleCount / scaledMaxCount) * chartHeight;
            const orangeHeight = (bucket.orangeCount / scaledMaxCount) * chartHeight;

            return (
              <g key={i}>
                {/* Apple bar (red) */}
                <rect
                  x={xBase + (1150 / numBuckets) * 0.09}
                  y={chartHeight - appleHeight}
                  width={barWidthPx}
                  height={Math.max(appleHeight, 0)}
                  className="fill-red-500 transition-opacity hover:opacity-80"
                  rx="1"
                >
                  <title>{`${bucket.label}: ${bucket.appleCount} Apple satisfaction score${bucket.appleCount !== 1 ? 's' : ''}`}</title>
                </rect>

                {/* Orange bar (orange) */}
                <rect
                  x={xBase + (1150 / numBuckets) * 0.09 + barWidthPx + gapPx}
                  y={chartHeight - orangeHeight}
                  width={barWidthPx}
                  height={Math.max(orangeHeight, 0)}
                  className="fill-orange-500 transition-opacity hover:opacity-80"
                  rx="1"
                >
                  <title>{`${bucket.label}: ${bucket.orangeCount} Orange satisfaction score${bucket.orangeCount !== 1 ? 's' : ''}`}</title>
                </rect>
              </g>
            );
          })}

          {/* X-axis grid lines and labels every 5% */}
          {Array.from({ length: 21 }, (_, k) => k * 5).map((pct) => {
            const xPos = (pct / 100) * 1150;
            return (
              <g key={pct}>
                {/* Vertical grid line */}
                <line
                  x1={xPos}
                  y1={0}
                  x2={xPos}
                  y2={chartHeight}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="1"
                  strokeDasharray={pct === 0 ? "0" : "4 4"}
                />
                {/* X-axis label */}
                <text
                  x={xPos}
                  y={chartHeight + 25}
                  textAnchor="middle"
                  className="fill-white/50"
                  fontSize="11"
                >
                  {pct}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Axis labels */}
        <div className="mt-1 flex items-center justify-between text-[10px] text-white/40">
          <div className="ml-1">Match Quality →</div>
          <div className="mr-1">← Count</div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">
            {((buckets.reduce((sum, b) => sum + b.appleCount * ((b.min + b.max) / 2), 0) / matches.length) * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-[10px] text-white/50">
            Avg Apple
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-orange-400">
            {((buckets.reduce((sum, b) => sum + b.orangeCount * ((b.min + b.max) / 2), 0) / matches.length) * 100).toFixed(1)}%
          </div>
          <div className="mt-0.5 text-[10px] text-white/50">
            Avg Orange
          </div>
        </div>
      </div>
    </div>
  );
}
