import { Suspense } from "react";
import { getDashboardData } from "./loader";
import { RunMatchingButton } from "./RunMatchingButton";
import { MatchVisualization } from "./components/MatchVisualization";

// =============================================================================
// ⚠️  DISCLAIMER
// =============================================================================
// This dashboard is SCAFFOLDING ONLY. Feel free to:
// - Completely redesign the layout and components
// - Remove any sections that don't fit your vision
// - Add entirely new metrics and visualizations
// - Change the styling, colors, and theme
//
// BE CREATIVE! This is just a starting point to get you going.
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

// These are example types - define your own based on your solution!
export interface MatchMetrics {
  totalApples: number;
  totalOranges: number;
  totalMatches: number;
  successRate: number;
}

// =============================================================================
// SERVER DATA LOADING
// =============================================================================

async function DashboardContent() {
  const data = await getDashboardData();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* 
        ⚠️ EXAMPLE METRICS - Replace with your own!
        Think about what metrics actually demonstrate your system is working well.
        These are just placeholders to show the pattern.
      */}
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
        title="Total Matches"
        value={data.metrics.totalMatches}
        icon="🍐"
        description="Successful pear-ings"
      />
      <MetricCard
        title="Success Rate"
        value={`${data.metrics.successRate}%`}
        icon="📊"
        description="Match success rate"
      />
    </div>
  );
}

// =============================================================================
// COMPONENTS
// =============================================================================

// ⚠️ These components are examples - build your own or modify as needed!

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

/**
 * A helper component to display scaffold notes in the UI.
 * Remove this component entirely when building your solution!
 */
function ScaffoldNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-dashed border-amber-400/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200 backdrop-blur-sm">
      <span className="mr-2">💡</span>
      {children}
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                🍎 Matchmaking Dashboard 🍊
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Creating perfect pears, one match at a time
              </p>
            </div>
            <div className="flex items-center gap-4">
              <RunMatchingButton />
              <button className="btn-secondary">New Conversation</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Metrics Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Overview Metrics</h2>
          <ScaffoldNote>
            <strong>This entire section is just an example!</strong> Think about
            what metrics actually prove your matchmaking system works well.
            Quality over quantity - pick metrics that tell a compelling story.
          </ScaffoldNote>
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
          </Suspense>
        </section>

        {/* Visualization Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">
            Matchmaking Visualization
          </h2>
          <MatchVisualization />
        </section>

        {/* Recent Matches Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Recent Matches</h2>
          <ScaffoldNote>
            <strong>A table might not be the best way to show matches.</strong>{" "}
            Consider cards, a feed, or something more visual. You decide what
            data to show and how to present it.
          </ScaffoldNote>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Apple
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Orange
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Match Score
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-white/60"
                    >
                      No matches yet. Start a new conversation to create your
                      first pear! 🍐
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-white">Analytics</h2>
          <ScaffoldNote>
            <strong>
              These chart placeholders are arbitrary examples - don&apos;t feel bound
              to them!
            </strong>{" "}
            Design analytics that demonstrate YOUR system&apos;s performance. What
            metrics convince YOU that the matchmaking is working well?
          </ScaffoldNote>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card min-h-[300px]">
              <h3 className="mb-4 font-semibold text-white/80">
                Example: Match Quality Distribution
              </h3>
              <div className="flex h-full items-center justify-center text-white/50">
                <p className="text-sm">
                  Replace with your own analytics component
                </p>
              </div>
            </div>
            <div className="card min-h-[300px]">
              <h3 className="mb-4 font-semibold text-white/80">
                Example: Matches Over Time
              </h3>
              <div className="flex h-full items-center justify-center text-white/50">
                <p className="text-sm">
                  Replace with your own analytics component
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <footer className="mt-16 rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-5 text-center text-sm text-white/70 backdrop-blur-sm">
          <p className="font-semibold text-white">🚀 This entire dashboard is just scaffolding!</p>
          <p className="mt-1">
            Feel free to completely redesign, restructure, or rebuild from
            scratch.
          </p>
        </footer>
      </main>
    </div>
  );
}
