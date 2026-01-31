// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { generateOrange, communicateAttributes, communicatePreferences } from "../_shared/generateFruit.ts";
import { getDb } from "../_shared/db.ts";
import { computeMatchScores, type FruitData } from "../_shared/matchingScorer.ts";

/**
 * Get Incoming Orange Edge Function
 *
 * Task Flow:
 * 1. Generate a new orange instance
 * 2. Capture the new orange's communication (attributes and preferences)
 * 3. Store the new orange in SurrealDB
 * 4. Match the new orange to existing apples
 * 5. Communicate matching results back to the orange via LLM
 */

// CORS headers for local development
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Step 1: Generate a new orange instance
    const orange = generateOrange();

    // Step 2: Capture the orange's communication
    // The orange expresses its attributes and preferences
    const orangeAttrs = communicateAttributes(orange);
    const orangePrefs = communicatePreferences(orange);

    // Step 3: Store the new orange in SurrealDB
    const db = await getDb();
    const createdOrange = await db.create("oranges", {
      type: orange.type,
      attributes: orange.attributes,
      preferences: orange.preferences,
    });

    // Step 4: Match the new orange to existing apples
    // Fetch active soft-criteria algorithm
    const algorithmResult = await db.query<[{ id: string; key: string; name: string; version: string }[]]>(
      `SELECT * FROM matching_algorithm WHERE key = 'soft-criteria-v1' AND status = 'active' LIMIT 1`
    );
    const algorithm = algorithmResult[0]?.[0];

    // Fetch all apples
    const applesResult = await db.query<[FruitData[]]>(`SELECT * FROM apples`);
    const apples = applesResult[0] || [];

    // Compute matches and insert records
    const orangeData: FruitData = {
      attributes: orange.attributes,
      preferences: orange.preferences,
    };

    const matches = [];
    for (const apple of apples) {
      const appleData: FruitData = {
        attributes: apple.attributes,
        preferences: apple.preferences,
      };

      const scores = computeMatchScores(appleData, orangeData);

      // Insert match record if algorithm exists
      if (algorithm) {
        // deno-lint-ignore no-explicit-any
        const appleRecord = apple as any;
        const matchRecord = await db.create("match", {
          incomingFruitId: createdOrange.id,
          incomingKind: "orange",
          appleId: appleRecord.id,
          orangeId: createdOrange.id,
          matchingAlgorithmId: algorithm.id,
          matchingAlgorithmName: algorithm.name,
          matchingAlgorithmVersion: algorithm.version,
          overallScore: scores.overallScore,
          scoreAppleOnOrange: scores.scoreAppleOnOrange,
          scoreOrangeOnApple: scores.scoreOrangeOnApple,
          passedHardConstraints: true, // soft criteria only
          violations: [],
          appleStatus: "pending",
          orangeStatus: "pending",
          status: "proposed",
          reason: "", // TODO: LLM later
          reasonData: scores.breakdown,
        });

        matches.push({
          matchId: matchRecord.id,
          appleId: appleRecord.id,
          scores,
        });
      }
    }

    // Step 5: Communicate matching results via LLM
    // TODO: Implement matching results communication logic

    return new Response(JSON.stringify({
      message: "Orange received and stored",
      orangeId: createdOrange.id,
      communication: {
        attributes: orangeAttrs,
        preferences: orangePrefs,
      },
      matchCount: matches.length,
      matches: matches,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing incoming orange:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process incoming orange",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
