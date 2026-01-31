/**
 * Tests for OpenAI API integration and match message generation.
 *
 * These are integration tests that make real API calls.
 * Requires OPENAI_API_KEY to be set in the environment.
 *
 * Run with:
 * OPENAI_API_KEY=sk-... deno test --allow-env --allow-net --config supabase/functions/_shared/deno.json supabase/functions/_shared/openai.test.ts
 */

import { assert, assertExists, assertEquals } from "std/assert";
import { createChatCompletion } from "./openai.ts";
import { generateMatchMessages, type MatchContext } from "./matchMessages.ts";

// ============================================================================
// createChatCompletion Tests
// ============================================================================

Deno.test("createChatCompletion - returns null when API key is missing", async () => {
  const originalKey = Deno.env.get("OPENAI_API_KEY");

  // Temporarily unset the key
  Deno.env.delete("OPENAI_API_KEY");

  const result = await createChatCompletion([
    { role: "user", content: "Say hello" },
  ]);

  assertEquals(result, null, "Should return null without API key");

  // Restore the key
  if (originalKey) {
    Deno.env.set("OPENAI_API_KEY", originalKey);
  }
});

Deno.test("createChatCompletion - makes a real API call", async () => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.warn("  SKIPPED: OPENAI_API_KEY not set");
    return;
  }

  const result = await createChatCompletion([
    { role: "user", content: "Reply with exactly: FRUIT_TEST_OK" },
  ], { temperature: 0, maxTokens: 20 });

  assertExists(result, "Should return a result");
  assertExists(result.content, "Should have content");
  assert(result.content.length > 0, "Content should not be empty");
  assert(
    result.content.includes("FRUIT_TEST_OK"),
    `Expected 'FRUIT_TEST_OK' in response, got: '${result.content}'`,
  );

  console.log(`  API response: "${result.content}"`);
  console.log(`  Finish reason: ${result.finishReason}`);
});

// ============================================================================
// generateMatchMessages Tests
// ============================================================================

const sampleMatchContext: MatchContext = {
  incomingKind: "apple",
  overallScore: 0.82,
  scoreAppleOnOrange: 0.85,
  scoreOrangeOnApple: 0.79,
  breakdown: {
    appleOnOrange: {
      size: 0.9,
      weight: 0.8,
      hasStem: 1.0,
      hasWorm: 1.0,
      shineFactor: 0.7,
    },
    orangeOnApple: {
      size: 0.85,
      weight: 0.75,
      hasLeaf: 1.0,
      hasChemicals: 1.0,
    },
  },
  incomingAttributes: {
    size: 7.5,
    weight: 180,
    hasStem: true,
    hasLeaf: false,
    hasWorm: false,
    shineFactor: "shiny",
    hasChemicals: false,
  },
  incomingPreferences: {
    size: { min: 5, max: 10 },
    hasWorm: false,
    hasStem: true,
  },
  existingAttributes: {
    size: 8.0,
    weight: 200,
    hasStem: true,
    hasLeaf: true,
    hasWorm: false,
    shineFactor: "neutral",
    hasChemicals: false,
  },
  existingPreferences: {
    size: { min: 6, max: 9 },
    hasLeaf: true,
    hasChemicals: false,
  },
};

Deno.test("generateMatchMessages - produces both messages", async () => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    console.warn("  SKIPPED: OPENAI_API_KEY not set");
    return;
  }

  const messages = await generateMatchMessages(sampleMatchContext);

  assertExists(messages, "Should return a messages object");
  assertExists(messages.messageToIncoming, "Should have messageToIncoming");
  assertExists(messages.messageToExisting, "Should have messageToExisting");

  assert(messages.messageToIncoming.length > 10, "Incoming message should be substantial");
  assert(messages.messageToExisting.length > 10, "Existing message should be substantial");

  console.log(`\n  === Message to Incoming Apple ===`);
  console.log(`  ${messages.messageToIncoming}`);
  console.log(`\n  === Message to Existing Orange ===`);
  console.log(`  ${messages.messageToExisting}`);
});
