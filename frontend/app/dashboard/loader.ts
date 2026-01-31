import type { MatchMetrics } from "./page";
import type { Apple, Orange } from "./types";
import { getDb } from "@/lib/db";

export interface DashboardData {
  metrics: MatchMetrics;
  apples: Apple[];
  oranges: Orange[];
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
      SELECT * FROM apples ORDER BY id DESC;
      SELECT * FROM oranges ORDER BY id DESC;
    `;

    const results = await db.query<unknown[]>(queries);

    // Extract counts from results - each result.result is an array with one object
    const totalApples = Array.isArray(results[0]?.result) 
      ? (results[0].result[0] as { count: number })?.count ?? 0 
      : 0;
    const totalOranges = Array.isArray(results[1]?.result) 
      ? (results[1].result[0] as { count: number })?.count ?? 0 
      : 0;
    const totalMatches = Array.isArray(results[2]?.result) 
      ? (results[2].result[0] as { count: number })?.count ?? 0 
      : 0;

    // Extract apples and oranges lists
    const apples = Array.isArray(results[3]?.result) 
      ? (results[3].result as Apple[])
      : [];
    const oranges = Array.isArray(results[4]?.result) 
      ? (results[4].result as Orange[])
      : [];

    // Debug: Log first apple to see structure
    if (apples.length > 0) {
      console.log("First apple from DB:", JSON.stringify(apples[0], null, 2));
    }

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

    return { metrics, apples, oranges };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);

    // Return fallback data if database is unavailable
    const metrics: MatchMetrics = {
      totalApples: 0,
      totalOranges: 0,
      totalMatches: 0,
      successRate: 0,
    };

    return { metrics, apples: [], oranges: [] };
  }
}
