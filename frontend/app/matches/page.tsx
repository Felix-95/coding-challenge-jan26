import { Suspense } from "react";
import { getDashboardData } from "../dashboard/loader";
import { FruitColumns } from "../dashboard/components/FruitColumns";
import Link from "next/link";

async function MatchesContent() {
  const data = await getDashboardData();

  return <FruitColumns apples={data.apples} oranges={data.oranges} />;
}

function MatchesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-12">
      {/* Apple Column Skeleton */}
      <div className="flex flex-col">
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>

      {/* Orange Column Skeleton */}
      <div className="flex flex-col">
        <div className="mb-6 h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  return (
    <div className="min-h-screen">
      {/* Header with modern glass-morphic design */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  🍎 Matchmaking Dashboard 🍊
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  Creating perfect pears, one match at a time
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="btn-secondary">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Match Visualization */}
      <main className="mx-auto max-w-[1600px] px-6 py-12 xl:px-12">
        <section>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Detailed Match View
            </h2>
            <p className="text-sm text-white/60">
              Click on any fruit to see match scores and sort by compatibility
            </p>
          </div>
          <Suspense fallback={<MatchesSkeleton />}>
            <MatchesContent />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
