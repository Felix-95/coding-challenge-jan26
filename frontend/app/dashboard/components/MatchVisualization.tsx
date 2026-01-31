import { Suspense } from "react";
import { getDashboardData } from "../loader";
import { FruitColumns } from "./FruitColumns";

async function MatchVisualizationContent() {
  const data = await getDashboardData();

  return <FruitColumns apples={data.apples} oranges={data.oranges} />;
}

function MatchVisualizationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Apple Column Skeleton */}
      <div className="flex flex-col">
        <div className="mb-4 h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="max-h-[600px] space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>

      {/* Orange Column Skeleton */}
      <div className="flex flex-col">
        <div className="mb-4 h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="max-h-[600px] space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MatchVisualization() {
  return (
    <Suspense fallback={<MatchVisualizationSkeleton />}>
      <MatchVisualizationContent />
    </Suspense>
  );
}
