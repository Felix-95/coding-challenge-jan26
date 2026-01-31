import type { MatchMetrics } from "./page";
import type { Apple, Orange } from "./types";
import { getDb } from "@/lib/db";

export interface BestMatch {
  id: string;
  appleId: string;
  orangeId: string;
  incomingKind: "apple" | "orange";
  overallScore: number;
  scoreAppleOnOrange: number;
  scoreOrangeOnApple: number;
  status: string;
  createdAt: string;
  messageToIncoming?: string;
  messageToExisting?: string;
}

export interface MatchingAlgorithm {
  id: string;
  key: string;
  name: string;
  version: string;
  description: string;
  status: "active" | "deprecated";
}

export interface DashboardData {
  metrics: MatchMetrics;
  apples: Apple[];
  oranges: Orange[];
  bestMatches: BestMatch[];
  bestMatchScores: Array<{
    scoreAppleOnOrange: number;
    scoreOrangeOnApple: number;
  }>;
  bestMatchesOverTime: Array<{
    scoreAppleOnOrange: number;
    scoreOrangeOnApple: number;
    createdAt: string;
  }>;
  algorithms: MatchingAlgorithm[];
  error?: string;
}

/**
 * Server-side data loader for the dashboard page.
 * Queries SurrealDB directly to fetch real-time metrics.
 */
export async function getDashboardData(): Promise<DashboardData> {
  try {
    const db = await getDb();

    // Query counts for apples, oranges, and best matches only
    const queries = `
      SELECT count() FROM apples GROUP ALL;
      SELECT count() FROM oranges GROUP ALL;
      SELECT count() FROM match WHERE bestMatch = true GROUP ALL;
      SELECT * FROM apples ORDER BY id DESC;
      SELECT * FROM oranges ORDER BY id DESC;
      SELECT * FROM match WHERE bestMatch = true ORDER BY createdAt DESC LIMIT 10;
      SELECT overallScore FROM match WHERE bestMatch = true;
      SELECT scoreAppleOnOrange, scoreOrangeOnApple FROM match WHERE bestMatch = true;
      SELECT scoreAppleOnOrange, scoreOrangeOnApple, createdAt FROM match WHERE bestMatch = true ORDER BY createdAt ASC;
      SELECT * FROM matching_algorithm WHERE status = 'active' ORDER BY createdAt ASC;
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
    
    // Extract best matches (limited to 10 for display)
    const bestMatches = Array.isArray(results[5]?.result)
      ? (results[5].result as BestMatch[])
      : [];
    
    // Extract all best match scores for average calculation and chart
    const allBestMatchScores = Array.isArray(results[6]?.result)
      ? (results[6].result as { overallScore: number }[])
      : [];
    
    // For the distribution chart, we need the directional scores from all best matches
    const allDirectionalScores = Array.isArray(results[7]?.result)
      ? (results[7].result as Array<{ scoreAppleOnOrange: number; scoreOrangeOnApple: number }>)
      : [];
    
    const bestMatchScores = allDirectionalScores;
    
    // For the time series chart, we need scores with timestamps
    const bestMatchesOverTime = Array.isArray(results[8]?.result)
      ? (results[8].result as Array<{ scoreAppleOnOrange: number; scoreOrangeOnApple: number; createdAt: string }>)
      : [];

    // Calculate average match score as success rate (0-100%) with 1 decimal place
    const successRate = allBestMatchScores.length > 0
      ? Math.round(
          (allBestMatchScores.reduce((sum, m) => sum + m.overallScore, 0) / 
           allBestMatchScores.length) * 1000
        ) / 10
      : 0;

    const metrics: MatchMetrics = {
      totalApples,
      totalOranges,
      totalMatches,
      successRate,
    };

    // Extract algorithms
    const algorithms = Array.isArray(results[9]?.result)
      ? (results[9].result as MatchingAlgorithm[])
      : [];

    return { metrics, apples, oranges, bestMatches, bestMatchScores, bestMatchesOverTime, algorithms };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);

    // Return fallback data if database is unavailable
    const metrics: MatchMetrics = {
      totalApples: 0,
      totalOranges: 0,
      totalMatches: 0,
      successRate: 0,
    };

    return { metrics, apples: [], oranges: [], bestMatches: [], bestMatchScores: [], bestMatchesOverTime: [], algorithms: [], error: error instanceof Error ? error.message : "Failed to fetch dashboard data" };
  }
}
