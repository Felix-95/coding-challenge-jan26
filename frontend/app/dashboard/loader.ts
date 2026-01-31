import type { MatchMetrics } from "./page";
import { getDb } from "@/lib/db";

export interface DashboardData {
  metrics: MatchMetrics;
}

/**
 * Server-side data loader for the dashboard page.
 * Queries SurrealDB directly to fetch real-time metrics.
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const db = await getDb();

    // Query counts for apples, oranges, and matches
    const queries = `
      SELECT count() FROM apples GROUP ALL;
      SELECT count() FROM oranges GROUP ALL;
      SELECT count() FROM matches GROUP ALL;
    `;

    const results = await db.query<{ count: number }[]>(queries);

    // Extract counts from results - each result.result is an array with one object
    const totalApples = Array.isArray(results[0]?.result) 
      ? results[0].result[0]?.count ?? 0 
      : 0;
    const totalOranges = Array.isArray(results[1]?.result) 
      ? results[1].result[0]?.count ?? 0 
      : 0;
    const totalMatches = Array.isArray(results[2]?.result) 
      ? results[2].result[0]?.count ?? 0 
      : 0;

    // Calculate success rate (matches vs total fruits)
    const totalFruits = totalApples + totalOranges;
    const successRate = totalFruits > 0 
      ? Math.round((totalMatches / totalFruits) * 100) 
      : 0;

    const metrics: MatchMetrics = {
      totalApples,
      totalOranges,
      totalMatches,
      successRate,
    };

    return { metrics };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);

    // Return fallback data if database is unavailable
    const metrics: MatchMetrics = {
      totalApples: 0,
      totalOranges: 0,
      totalMatches: 0,
      successRate: 0,
    };

    return { metrics };
  }
}
