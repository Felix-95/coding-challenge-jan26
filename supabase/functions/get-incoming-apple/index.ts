// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { generateApple, communicateAttributes, communicatePreferences } from "../_shared/generateFruit.ts";
import { getDb } from "../_shared/db.ts";
import { computeMatchScores, type FruitData } from "../_shared/matchingScorer.ts";
import { generateMatchMessages, type MatchContext } from "../_shared/matchMessages.ts";

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
    const appleAttrs = await communicateAttributes(apple);
    const applePrefs = await communicatePreferences(apple);

    // Step 3: Store the new apple in SurrealDB
    const db = await getDb();
    const createdApple = await db.create("apples", {
      type: apple.type,
      attributes: apple.attributes,
      preferences: apple.preferences,
    });

    // Step 4: Match the new apple to existing oranges
    // Fetch active soft-criteria algorithm
    const algorithmResult = await db.query<{ id: string; key: string; name: string; version: string }[]>(
      `SELECT * FROM matching_algorithm WHERE key = 'soft-criteria-v1' AND status = 'active' LIMIT 1`
    );
    const algorithm = algorithmResult[0]?.result?.[0];

    // Fetch all oranges
    const orangesResult = await db.query<(FruitData & { id: string })[]>(`SELECT * FROM oranges`);
    const oranges = orangesResult[0]?.result || [];

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
        const matchRecord = await db.createWithRecords("match", {
          incomingFruitId: createdApple.id,
          incomingKind: "apple",
          appleId: createdApple.id,
          orangeId: orange.id,
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
          reason: "",
          reasonData: scores.breakdown,
        }, ["incomingFruitId", "appleId", "orangeId", "matchingAlgorithmId"]);

        matches.push({
          matchId: matchRecord.id,
          orangeId: orange.id,
          scores,
        });
      }
    }

    // Step 5: Generate LLM messages for highest-scoring match
    let messages: { messageToIncoming: string | null; messageToExisting: string | null } | null = null;

    if (matches.length > 0) {
      // Find highest-scoring match(es)
      const maxScore = Math.max(...matches.map(m => m.scores.overallScore));
      const topMatches = matches.filter(m => m.scores.overallScore === maxScore);
      
      // Randomly pick one if there are ties
      const bestMatch = topMatches[Math.floor(Math.random() * topMatches.length)];

      // Get the orange data for message generation
      const bestOrange = oranges.find((o) => o.id === bestMatch.orangeId);

      if (bestOrange) {
        const matchContext: MatchContext = {
          incomingKind: "apple",
          overallScore: bestMatch.scores.overallScore,
          scoreAppleOnOrange: bestMatch.scores.scoreAppleOnOrange,
          scoreOrangeOnApple: bestMatch.scores.scoreOrangeOnApple,
          breakdown: bestMatch.scores.breakdown,
          incomingAttributes: apple.attributes,
          incomingPreferences: apple.preferences,
          existingAttributes: bestOrange.attributes,
          existingPreferences: bestOrange.preferences,
        };

        messages = await generateMatchMessages(matchContext);

        // Update match record with messages and bestMatch flag in SurrealDB
        const updateParts: string[] = ["bestMatch = true"];
        if (messages.messageToIncoming) {
          updateParts.push(`messageToIncoming = "${messages.messageToIncoming.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);
        }
        if (messages.messageToExisting) {
          updateParts.push(`messageToExisting = "${messages.messageToExisting.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`);
        }

        await db.query(`UPDATE ${bestMatch.matchId} SET ${updateParts.join(", ")}`);
      }
    }

    return new Response(JSON.stringify({
      message: "Apple received and stored",
      appleId: createdApple.id,
      communication: {
        attributes: appleAttrs,
        preferences: applePrefs,
      },
      matchCount: matches.length,
      matches: matches,
      messages: messages,
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
