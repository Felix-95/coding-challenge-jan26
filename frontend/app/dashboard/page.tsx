import { Suspense } from "react";
import { getDashboardData } from "./loader";
import { RunMatchingButton } from "./RunMatchingButton";
import Link from "next/link";
import { MatchQualityChart } from "./components/MatchQualityChart";
import { MatchesOverTimeChart } from "./components/MatchesOverTimeChart";
import { BestMatchesTable } from "./components/BestMatchesTable";
import { AlgorithmSelector } from "./components/AlgorithmSelector";

// =============================================================================
// TYPES
// =============================================================================

export interface MatchMetrics {
  totalApples: number;
  totalOranges: number;
  totalMatches: number;
  successRate: number; // Now represents average score with 1 decimal place
}

// =============================================================================
// SERVER DATA LOADING
// =============================================================================

async function AlgorithmSelectorContent() {
  const data = await getDashboardData();

  return <AlgorithmSelector algorithms={data.algorithms} />;
}

async function MetricsContent() {
  const data = await getDashboardData();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Apples"
        value={data.metrics.totalApples}
        icon="🍎"
        description="Apples in the system"
      />
      <MetricCard
        title="Total Oranges"
        value={data.metrics.totalOranges}
        icon="🍊"
        description="Oranges in the system"
      />
      <MetricCard
        title="Best Matches"
        value={data.metrics.totalMatches}
        icon="🍐"
        description="Total best matches"
      />
      <MetricCard
        title="Avg Match Score"
        value={`${data.metrics.successRate.toFixed(1)}%`}
        icon="📊"
        description="Average best match quality"
      />
    </div>
  );
}

async function BestMatchesContent() {
  const data = await getDashboardData();

  return <BestMatchesTable matches={data.bestMatches} />;
}

async function MatchQualityChartContent() {
  const data = await getDashboardData();

  return <MatchQualityChart matches={data.bestMatchScores} />;
}

async function MatchesOverTimeChartContent() {
  const data = await getDashboardData();

  return <MatchesOverTimeChart matches={data.bestMatchesOverTime} />;
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
  description: string;
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {title}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className="mt-2 text-sm text-white/60">{description}</p>
      </div>
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="metric-card animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="mt-4">
        <div className="h-8 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

// =============================================================================
// PAGE
// =============================================================================

export default function DashboardPage() {
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
              <Suspense fallback={<div className="h-9 w-48 animate-pulse rounded-lg bg-white/10" />}>
                <AlgorithmSelectorContent />
              </Suspense>
              <RunMatchingButton />
              <Link href="/matches" className="btn-secondary">
                Detailed Matches →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Metrics Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Overview Metrics</h2>
          <Suspense fallback={<DashboardSkeleton />}>
            <MetricsContent />
          </Suspense>
        </section>

        {/* Recent Matches Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Recent Best Matches</h2>
          <Suspense fallback={<div className="card animate-pulse h-64" />}>
            <BestMatchesContent />
          </Suspense>
        </section>

        {/* Analytics Section */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-white">Analytics</h2>
          <div className="space-y-6">
            {/* Match Quality Distribution */}
            <div className="card">
              <h3 className="mb-4 font-semibold text-white/80">
                Match Quality Distribution
              </h3>
              <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-white/50"><p className="text-sm">Loading chart...</p></div>}>
                <MatchQualityChartContent />
              </Suspense>
            </div>
            
            {/* Satisfaction Over Time */}
            <div className="card">
              <h3 className="mb-4 font-semibold text-white/80">
                Satisfaction Over Time
              </h3>
              <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-white/50"><p className="text-sm">Loading chart...</p></div>}>
                <MatchesOverTimeChartContent />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
