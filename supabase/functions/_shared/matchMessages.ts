/**
 * Match Message Generation Module
 *
 * Generates personalized LLM messages for fruit matches.
 * Each match gets two distinct messages:
 * - messageToIncoming: For the fruit that just arrived
 * - messageToExisting: For the fruit that was waiting
 */

import { createChatCompletion, type ChatMessage } from "./openai.ts";
import type { FruitAttributes, FruitPreferences } from "./generateFruit.ts";
import type { ScoringBreakdown } from "./matchingScorer.ts";

export interface MatchContext {
  incomingKind: "apple" | "orange";
  overallScore: number;
  scoreAppleOnOrange: number;
  scoreOrangeOnApple: number;
  breakdown: ScoringBreakdown;
  incomingAttributes: FruitAttributes;
  incomingPreferences: FruitPreferences;
  existingAttributes: FruitAttributes;
  existingPreferences: FruitPreferences;
}

export interface MatchMessages {
  messageToIncoming: string;
  messageToExisting: string;
}

const SYSTEM_PROMPT = `You are a charming and playful fruit matchmaker with a talent for fruit puns. Your job is to write personalized messages announcing matches between apples and oranges.

Guidelines:
- Keep messages warm, celebratory, and fun (2-3 sentences max)
- Include at least one fruit-related pun or wordplay
- Reference specific compatibility details from the match data
- Be encouraging about the match quality
- Each message should feel personalized, not generic`;

function formatPercentage(score: number): string {
  return `${Math.round(score * 100)}%`;
}

function getCompatibilityHighlights(
  breakdown: Record<string, number>,
  preferences: FruitPreferences,
  attributes: FruitAttributes
): string[] {
  const highlights: string[] = [];

  for (const [attr, score] of Object.entries(breakdown)) {
    if (score === 1.0) {
      const prefValue = preferences[attr as keyof FruitPreferences];
      const attrValue = attributes[attr as keyof FruitAttributes];

      // Only mention if there was an actual preference (not just "don't care")
      if (prefValue !== undefined) {
        switch (attr) {
          case "hasWorm":
            if (prefValue === false && attrValue === false) {
              highlights.push("both worm-free");
            }
            break;
          case "hasChemicals":
            if (prefValue === false && attrValue === false) {
              highlights.push("chemical-free match");
            }
            break;
          case "shineFactor":
            if (attrValue) {
              highlights.push(`${attrValue} shine compatibility`);
            }
            break;
          case "hasStem":
            if (prefValue === true && attrValue === true) {
              highlights.push("stem lovers");
            }
            break;
          case "hasLeaf":
            if (prefValue === true && attrValue === true) {
              highlights.push("leaf enthusiasts");
            }
            break;
          case "size":
            highlights.push("size match");
            break;
          case "weight":
            highlights.push("weight compatibility");
            break;
        }
      }
    }
  }

  return highlights.slice(0, 3); // Limit to top 3 highlights
}

function buildIncomingPrompt(context: MatchContext): string {
  const existingKind = context.incomingKind === "apple" ? "orange" : "apple";
  const scorePercent = formatPercentage(context.overallScore);

  // Get what the incoming fruit liked about the existing one
  const incomingBreakdown =
    context.incomingKind === "apple"
      ? context.breakdown.appleOnOrange
      : context.breakdown.orangeOnApple;

  const highlights = getCompatibilityHighlights(
    incomingBreakdown,
    context.incomingPreferences,
    context.existingAttributes
  );

  const highlightText =
    highlights.length > 0
      ? `Key compatibilities: ${highlights.join(", ")}.`
      : "";

  return `Write a welcoming message for a ${context.incomingKind} who just arrived and was matched with an ${existingKind}.

Match details:
- Overall compatibility: ${scorePercent}
- The ${context.incomingKind} is the newcomer who just arrived
${highlightText}

Tone: Excited and welcoming - they just arrived and found a great match!
Keep it to 2-3 sentences.`;
}

function buildExistingPrompt(context: MatchContext): string {
  const existingKind = context.incomingKind === "apple" ? "orange" : "apple";
  const scorePercent = formatPercentage(context.overallScore);

  // Get what the existing fruit liked about the incoming one
  const existingBreakdown =
    context.incomingKind === "apple"
      ? context.breakdown.orangeOnApple
      : context.breakdown.appleOnOrange;

  const highlights = getCompatibilityHighlights(
    existingBreakdown,
    context.existingPreferences,
    context.incomingAttributes
  );

  const highlightText =
    highlights.length > 0
      ? `Key compatibilities: ${highlights.join(", ")}.`
      : "";

  return `Write a celebratory message for an ${existingKind} who has been waiting and now has a match with a ${context.incomingKind}.

Match details:
- Overall compatibility: ${scorePercent}
- The ${existingKind} was waiting and a ${context.incomingKind} just arrived
${highlightText}

Tone: Reassuring and celebratory - the wait was worth it!
Keep it to 2-3 sentences.`;
}

/**
 * Generate personalized messages for a match.
 * Makes parallel API calls for both messages.
 * Throws if either LLM call fails.
 */
export async function generateMatchMessages(
  context: MatchContext
): Promise<MatchMessages> {
  const systemMessage: ChatMessage = {
    role: "system",
    content: SYSTEM_PROMPT,
  };

  const incomingPrompt = buildIncomingPrompt(context);
  const existingPrompt = buildExistingPrompt(context);

  const [incomingResult, existingResult] = await Promise.all([
    createChatCompletion([
      systemMessage,
      { role: "user", content: incomingPrompt },
    ]),
    createChatCompletion([
      systemMessage,
      { role: "user", content: existingPrompt },
    ]),
  ]);

  if (!incomingResult) {
    throw new Error("LLM call failed: could not generate match message for incoming fruit");
  }
  if (!existingResult) {
    throw new Error("LLM call failed: could not generate match message for existing fruit");
  }

  return {
    messageToIncoming: incomingResult.content,
    messageToExisting: existingResult.content,
  };
}
