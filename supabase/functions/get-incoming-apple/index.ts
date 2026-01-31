// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { generateApple, communicateAttributes, communicatePreferences } from "../_shared/generateFruit.ts";
import { getDb } from "../_shared/db.ts";
import { computeMatchScores, type FruitData } from "../_shared/matchingScorer.ts";

/**
 * Get Incoming Apple Edge Function
 *
 * Task Flow:
 * 1. Generate a new apple instance
 * 2. Capture the new apple's communication (attributes and preferences)
 * 3. Store the new apple in SurrealDB
 * 4. Match the new apple to existing oranges
 * 5. Communicate matching results back to the apple via LLM
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
    // Step 1: Generate a new apple instance
    const apple = generateApple();

    // Step 2: Capture the apple's communication
    // The apple expresses its attributes and preferences
    const appleAttrs = communicateAttributes(apple);
    const applePrefs = communicatePreferences(apple);

    // Step 3: Store the new apple in SurrealDB
    const db = await getDb();
    const createdApple = await db.create("apples", {
      type: apple.type,
      attributes: apple.attributes,
      preferences: apple.preferences,
    });

    // Step 4: Match the new apple to existing oranges
    // Fetch active soft-criteria algorithm
    const algorithmResult = await db.query<[{ id: string; key: string; name: string; version: string }[]]>(
      `SELECT * FROM matching_algorithm WHERE key = 'soft-criteria-v1' AND status = 'active' LIMIT 1`
    );
    const algorithm = algorithmResult[0]?.[0];

    // Fetch all oranges
    const orangesResult = await db.query<[FruitData[]]>(`SELECT * FROM oranges`);
    const oranges = orangesResult[0] || [];

    // Compute matches and insert records
    const appleData: FruitData = {
      attributes: apple.attributes,
      preferences: apple.preferences,
    };

    const matches = [];
    for (const orange of oranges) {
      const orangeData: FruitData = {
        attributes: orange.attributes,
        preferences: orange.preferences,
      };

      const scores = computeMatchScores(appleData, orangeData);

      // Insert match record if algorithm exists
      if (algorithm) {
        // deno-lint-ignore no-explicit-any
        const orangeRecord = orange as any;
        const matchRecord = await db.create("match", {
          incomingFruitId: createdApple.id,
          incomingKind: "apple",
          appleId: createdApple.id,
          orangeId: orangeRecord.id,
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
          orangeId: orangeRecord.id,
          scores,
        });
      }
    }

    // Step 5: Communicate matching results via LLM
    // TODO: Implement matching results communication logic

    return new Response(JSON.stringify({
      message: "Apple received and stored",
      appleId: createdApple.id,
      communication: {
        attributes: appleAttrs,
        preferences: applePrefs,
      },
      matchCount: matches.length,
      matches: matches,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing incoming apple:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process incoming apple",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
