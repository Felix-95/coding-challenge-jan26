/**
 * Fruit Generation Utilities
 *
 * Generates random fruits with normally distributed attributes
 * and reasonably relaxed preferences.
 */

import { createChatCompletion } from "./openai.ts";

// ============================================================================
// Types
// ============================================================================

export type FruitType = "apple" | "orange";
export type ShineFactor = "dull" | "neutral" | "shiny" | "extraShiny";

export interface FruitAttributes {
  size: number | null;
  weight: number | null;
  hasStem: boolean | null;
  hasLeaf: boolean | null;
  hasWorm: boolean | null;
  shineFactor: ShineFactor | null;
  hasChemicals: boolean | null;
}

export interface NumberRange {
  min?: number;
  max?: number;
}

export interface FruitPreferences {
  size?: NumberRange;
  weight?: NumberRange;
  hasStem?: boolean;
  hasLeaf?: boolean;
  hasWorm?: boolean;
  shineFactor?: ShineFactor | ShineFactor[];
  hasChemicals?: boolean;
}

export interface Fruit {
  type: FruitType;
  attributes: FruitAttributes;
  preferences: FruitPreferences;
}

// ============================================================================
// Constants
// ============================================================================

const SHINE_FACTORS: ShineFactor[] = ["dull", "neutral", "shiny", "extraShiny"];

// Distribution parameters for attributes
const SIZE_MEAN = 7.0;
const SIZE_STD_DEV = 2.0;
const SIZE_MIN = 2.0;
const SIZE_MAX = 14.0;

const WEIGHT_MEAN = 180;
const WEIGHT_STD_DEV = 50;
const WEIGHT_MIN = 50;
const WEIGHT_MAX = 350;

// Probability of each attribute being null (unknown)
const NULL_PROBABILITY = 0.05;

// ============================================================================
// Random Utilities
// ============================================================================

/**
 * Generates a random number from a normal distribution using Box-Muller transform
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generates a normally distributed value clamped to a range
 */
function randomNormalClamped(
  mean: number,
  stdDev: number,
  min: number,
  max: number
): number {
  const value = randomNormal(mean, stdDev);
  return Math.round(Math.max(min, Math.min(max, value)) * 10) / 10;
}

/**
 * Returns true with the given probability
 */
function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Picks a random element from an array
 */
function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Picks multiple random elements from an array (no duplicates)
 */
function randomPickMultiple<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
}

// ============================================================================
// Attribute Generation
// ============================================================================

/**
 * Generates random attributes for a fruit
 */
function generateAttributes(type: FruitType): FruitAttributes {
  // Apples are slightly smaller on average
  const sizeMean = type === "apple" ? SIZE_MEAN - 0.5 : SIZE_MEAN + 0.5;
  const weightMean = type === "apple" ? WEIGHT_MEAN - 10 : WEIGHT_MEAN + 10;

  return {
    size: randomChance(NULL_PROBABILITY)
      ? null
      : randomNormalClamped(sizeMean, SIZE_STD_DEV, SIZE_MIN, SIZE_MAX),

    weight: randomChance(NULL_PROBABILITY)
      ? null
      : randomNormalClamped(weightMean, WEIGHT_STD_DEV, WEIGHT_MIN, WEIGHT_MAX),

    // Apples more likely to have stems
    hasStem: randomChance(NULL_PROBABILITY)
      ? null
      : type === "apple"
        ? randomChance(0.7)
        : randomChance(0.1),

    // Leaves are relatively rare
    hasLeaf: randomChance(NULL_PROBABILITY)
      ? null
      : randomChance(0.25),

    // Worms are rare
    hasWorm: randomChance(NULL_PROBABILITY)
      ? null
      : randomChance(0.08),

    // Shine factor with weighted distribution (neutral/shiny more common)
    shineFactor: randomChance(NULL_PROBABILITY)
      ? null
      : randomPick([
          "dull",
          "neutral",
          "neutral",
          "shiny",
          "shiny",
          "shiny",
          "extraShiny",
        ] as ShineFactor[]),

    // Chemicals somewhat common in commercial fruit
    hasChemicals: randomChance(NULL_PROBABILITY)
      ? null
      : randomChance(0.35),
  };
}

// ============================================================================
// Preference Generation
// ============================================================================

/**
 * Generates relaxed preferences for a fruit
 * Not all preferences are specified, and ranges are generous
 */
function generatePreferences(attributes: FruitAttributes): FruitPreferences {
  const preferences: FruitPreferences = {};

  // ~40% chance to have a size preference (generous range)
  if (randomChance(0.4) && attributes.size !== null) {
    const margin = randomNormalClamped(2.5, 1.0, 1.5, 5.0);
    const preferredSize = attributes.size + randomNormal(0, 1);

    // Sometimes only min, sometimes only max, sometimes both
    const rangeType = randomPick(["both", "min", "max"]);
    if (rangeType === "both" || rangeType === "min") {
      preferences.size = {
        ...preferences.size,
        min: Math.round(Math.max(SIZE_MIN, preferredSize - margin) * 10) / 10,
      };
    }
    if (rangeType === "both" || rangeType === "max") {
      preferences.size = {
        ...preferences.size,
        max: Math.round(Math.min(SIZE_MAX, preferredSize + margin) * 10) / 10,
      };
    }
  }

  // ~35% chance to have a weight preference (generous range)
  if (randomChance(0.35) && attributes.weight !== null) {
    const margin = randomNormalClamped(40, 15, 20, 80);
    const preferredWeight = attributes.weight + randomNormal(0, 20);

    const rangeType = randomPick(["both", "min", "max"]);
    if (rangeType === "both" || rangeType === "min") {
      preferences.weight = {
        ...preferences.weight,
        min: Math.round(Math.max(WEIGHT_MIN, preferredWeight - margin)),
      };
    }
    if (rangeType === "both" || rangeType === "max") {
      preferences.weight = {
        ...preferences.weight,
        max: Math.round(Math.min(WEIGHT_MAX, preferredWeight + margin)),
      };
    }
  }

  // ~25% chance to care about stem
  if (randomChance(0.25)) {
    preferences.hasStem = randomChance(0.6); // Slight preference for stems
  }

  // ~20% chance to care about leaf
  if (randomChance(0.2)) {
    preferences.hasLeaf = randomChance(0.5);
  }

  // ~60% chance to not want a worm (common preference)
  if (randomChance(0.6)) {
    preferences.hasWorm = false;
  }

  // ~45% chance to have shine preference (often multiple acceptable values)
  if (randomChance(0.45)) {
    const numAcceptable = randomPick([1, 2, 2, 3]); // Usually 2 acceptable values
    if (numAcceptable === 1) {
      preferences.shineFactor = randomPick(SHINE_FACTORS);
    } else {
      preferences.shineFactor = randomPickMultiple(SHINE_FACTORS, numAcceptable);
    }
  }

  // ~40% chance to prefer no chemicals
  if (randomChance(0.4)) {
    preferences.hasChemicals = randomChance(0.2); // Most prefer no chemicals
  }

  return preferences;
}

// ============================================================================
// Communication Functions (LLM-powered)
// ============================================================================

function formatAttributesForPrompt(fruit: Fruit): string {
  const { attributes, type } = fruit;
  const lines: string[] = [`Fruit type: ${type}`];

  if (attributes.size !== null) lines.push(`Size: ${attributes.size} units (range: 2-14)`);
  else lines.push("Size: unknown");

  if (attributes.weight !== null) lines.push(`Weight: ${attributes.weight} grams (range: 50-350)`);
  else lines.push("Weight: unknown");

  if (attributes.hasStem !== null) lines.push(`Has stem: ${attributes.hasStem}`);
  else lines.push("Has stem: unknown");

  if (attributes.hasLeaf !== null) lines.push(`Has leaf: ${attributes.hasLeaf}`);
  else lines.push("Has leaf: unknown");

  if (attributes.hasWorm !== null) lines.push(`Has worm: ${attributes.hasWorm}`);
  else lines.push("Has worm: unknown");

  if (attributes.shineFactor !== null) lines.push(`Shine factor: ${attributes.shineFactor}`);
  else lines.push("Shine factor: unknown");

  if (attributes.hasChemicals !== null) lines.push(`Has chemicals: ${attributes.hasChemicals}`);
  else lines.push("Has chemicals: unknown");

  return lines.join("\n");
}

function formatPreferencesForPrompt(fruit: Fruit): string {
  const { preferences, type } = fruit;
  const otherType = type === "apple" ? "orange" : "apple";
  const lines: string[] = [`Fruit type: ${type} (looking for an ${otherType})`];

  if (Object.keys(preferences).length === 0) {
    lines.push("Preferences: none (completely open-minded)");
    return lines.join("\n");
  }

  if (preferences.size) {
    const parts: string[] = [];
    if (preferences.size.min !== undefined) parts.push(`min ${preferences.size.min}`);
    if (preferences.size.max !== undefined) parts.push(`max ${preferences.size.max}`);
    lines.push(`Size preference: ${parts.join(", ")}`);
  }

  if (preferences.weight) {
    const parts: string[] = [];
    if (preferences.weight.min !== undefined) parts.push(`min ${preferences.weight.min}g`);
    if (preferences.weight.max !== undefined) parts.push(`max ${preferences.weight.max}g`);
    lines.push(`Weight preference: ${parts.join(", ")}`);
  }

  if (preferences.hasStem !== undefined) lines.push(`Wants stem: ${preferences.hasStem}`);
  if (preferences.hasLeaf !== undefined) lines.push(`Wants leaf: ${preferences.hasLeaf}`);
  if (preferences.hasWorm !== undefined) lines.push(`Wants worm: ${preferences.hasWorm}`);

  if (preferences.shineFactor !== undefined) {
    const vals = Array.isArray(preferences.shineFactor)
      ? preferences.shineFactor.join(", ")
      : preferences.shineFactor;
    lines.push(`Shine preference: ${vals}`);
  }

  if (preferences.hasChemicals !== undefined) lines.push(`Wants chemicals: ${preferences.hasChemicals}`);

  return lines.join("\n");
}

function buildFallbackAttributes(fruit: Fruit): string {

}

function buildFallbackPreferences(fruit: Fruit): string {
  const { preferences, type } = fruit;
  const otherType = type === "apple" ? "orange" : "apple";
  if (Object.keys(preferences).length === 0) {
    return `I'm open-minded about my ${otherType} match. No strict requirements.`;
  }
  const parts: string[] = [`Here's what I'm looking for in an ${otherType}.`];
  if (preferences.size) {
    if (preferences.size.min !== undefined && preferences.size.max !== undefined) parts.push(`Size between ${preferences.size.min} and ${preferences.size.max}.`);
    else if (preferences.size.min !== undefined) parts.push(`Size at least ${preferences.size.min}.`);
    else if (preferences.size.max !== undefined) parts.push(`Size at most ${preferences.size.max}.`);
  }
  if (preferences.weight) {
    if (preferences.weight.min !== undefined && preferences.weight.max !== undefined) parts.push(`Weight between ${preferences.weight.min}g and ${preferences.weight.max}g.`);
    else if (preferences.weight.min !== undefined) parts.push(`Weight at least ${preferences.weight.min}g.`);
    else if (preferences.weight.max !== undefined) parts.push(`Weight at most ${preferences.weight.max}g.`);
  }
  if (preferences.hasStem !== undefined) parts.push(preferences.hasStem ? "I'd like a stem." : "No stem preferred.");
  if (preferences.hasLeaf !== undefined) parts.push(preferences.hasLeaf ? "A leaf would be nice." : "No leaf needed.");
  if (preferences.hasWorm !== undefined) parts.push(preferences.hasWorm ? "A worm is fine." : "No worms please.");
  if (preferences.shineFactor !== undefined) {
    const vals = Array.isArray(preferences.shineFactor) ? preferences.shineFactor.join(" or ") : preferences.shineFactor;
    parts.push(`Shine: ${vals}.`);
  }
  if (preferences.hasChemicals !== undefined) parts.push(preferences.hasChemicals ? "Chemicals are fine." : "Chemical-free preferred.");
  return parts.join(" ");
}

/**
 * Generates a human-readable description of a fruit's attributes using LLM.
 * Falls back to a basic string if the LLM call fails.
 */
export async function communicateAttributes(fruit: Fruit): Promise<string> {
  const structuredData = formatAttributesForPrompt(fruit);

  const result = await createChatCompletion([
    {
      role: "system",
      content: `You are a fruit in a matchmaking system. Write a short, casual, first-person introduction describing your physical attributes. Be playful and personable – like a dating profile. Mention all known attributes naturally. For unknown attributes, either skip them or mention you're unsure. Keep it to 3-5 sentences. Do not use bullet points or lists.`,
    },
    {
      role: "user",
      content: `Here are your attributes:\n${structuredData}\n\nWrite your self-introduction.`,
    },
  ], { temperature: 0.9, maxTokens: 200 });

  if (!result) {
    return buildFallbackAttributes(fruit);
  }

  return result.content;
}

/**
 * Generates a human-readable description of a fruit's preferences using LLM.
 * Falls back to a basic string if the LLM call fails.
 */
export async function communicatePreferences(fruit: Fruit): Promise<string> {
  const structuredData = formatPreferencesForPrompt(fruit);

  const result = await createChatCompletion([
    {
      role: "system",
      content: `You are a fruit in a matchmaking system. Write a short, casual, first-person description of what you're looking for in a match. Be playful and personable – like a dating profile. Mention all stated preferences naturally. If you have no preferences, say you're open-minded. Keep it to 2-4 sentences. Do not use bullet points or lists.`,
    },
    {
      role: "user",
      content: `Here are your preferences:\n${structuredData}\n\nDescribe what you're looking for.`,
    },
  ], { temperature: 0.9, maxTokens: 200 });

  if (!result) {
    return buildFallbackPreferences(fruit);
  }

  return result.content;
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Generates a random fruit of the specified type
 *
 * @param type - The type of fruit to generate ("apple" or "orange")
 * @returns A randomly generated fruit with attributes and preferences
 */
export function generateFruit(type: FruitType): Fruit {
  const attributes = generateAttributes(type);
  const preferences = generatePreferences(attributes);

  return {
    type,
    attributes,
    preferences,
  };
}

/**
 * Generates a random apple
 */
export function generateApple(): Fruit {
  return generateFruit("apple");
}

/**
 * Generates a random orange
 */
export function generateOrange(): Fruit {
  return generateFruit("orange");
}

