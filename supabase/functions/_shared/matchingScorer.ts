/**
 * Matching Scorer Module
 *
 * Computes compatibility scores between fruits based on their preferences and attributes.
 * Uses soft-criteria matching: missing preferences = 1.0, null attributes = 0.0
 */

import type {
  FruitAttributes,
  FruitPreferences,
  NumberRange,
  ShineFactor,
} from "./generateFruit.ts";

// ============================================================================
// Types
// ============================================================================

export interface MatchScores {
  scoreAppleOnOrange: number; // apple's prefs vs orange's attrs
  scoreOrangeOnApple: number; // orange's prefs vs apple's attrs
  overallScore: number; // average of both
}

export interface ScoringBreakdown {
  appleOnOrange: Record<string, number>;
  orangeOnApple: Record<string, number>;
}

export interface DetailedMatchScores extends MatchScores {
  breakdown: ScoringBreakdown;
}

// ============================================================================
// Single Attribute Scoring
// ============================================================================

/**
 * Score a numeric attribute against a NumberRange preference.
 * - If attribute is null: return 0.0 (can't verify)
 * - If preference has no min/max: return 1.0 (no constraint)
 * - Otherwise: 1.0 if in range, 0.0 if outside
 */
function scoreNumericAttribute(
  preference: NumberRange | undefined,
  attribute: number | null
): number {
  // No preference = don't care = full score
  if (preference === undefined) {
    return 1.0;
  }

  // Null attribute = can't verify = no score
  if (attribute === null) {
    return 0.0;
  }

  const { min, max } = preference;

  // Check min constraint
  if (min !== undefined && attribute < min) {
    return 0.0;
  }

  // Check max constraint
  if (max !== undefined && attribute > max) {
    return 0.0;
  }

  return 1.0;
}

/**
 * Score a boolean attribute against a boolean preference.
 * - If attribute is null: return 0.0 (can't verify)
 * - If preference is undefined: return 1.0 (no preference)
 * - Otherwise: 1.0 if match, 0.0 if mismatch
 */
function scoreBooleanAttribute(
  preference: boolean | undefined,
  attribute: boolean | null
): number {
  // No preference = don't care = full score
  if (preference === undefined) {
    return 1.0;
  }

  // Null attribute = can't verify = no score
  if (attribute === null) {
    return 0.0;
  }

  return preference === attribute ? 1.0 : 0.0;
}

/**
 * Score a shineFactor attribute against preference (single value or array).
 * - If attribute is null: return 0.0 (can't verify)
 * - If preference is undefined: return 1.0 (no preference)
 * - Otherwise: 1.0 if attribute in accepted values, 0.0 otherwise
 */
function scoreShineFactorAttribute(
  preference: ShineFactor | ShineFactor[] | undefined,
  attribute: ShineFactor | null
): number {
  // No preference = don't care = full score
  if (preference === undefined) {
    return 1.0;
  }

  // Null attribute = can't verify = no score
  if (attribute === null) {
    return 0.0;
  }

  // Normalize preference to array
  const acceptedValues = Array.isArray(preference) ? preference : [preference];

  return acceptedValues.includes(attribute) ? 1.0 : 0.0;
}

// ============================================================================
// Full Preference Scoring
// ============================================================================

/**
 * Score all of fruit A's preferences against fruit B's attributes.
 * Returns the average score across all 7 attributes.
 * Missing preferences count as 1.0 (fruit doesn't care).
 */
export function scoreFruitPreferences(
  prefsA: FruitPreferences,
  attrsB: FruitAttributes
): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};

  // Score each attribute
  breakdown.size = scoreNumericAttribute(prefsA.size, attrsB.size);
  breakdown.weight = scoreNumericAttribute(prefsA.weight, attrsB.weight);
  breakdown.hasStem = scoreBooleanAttribute(prefsA.hasStem, attrsB.hasStem);
  breakdown.hasLeaf = scoreBooleanAttribute(prefsA.hasLeaf, attrsB.hasLeaf);
  breakdown.hasWorm = scoreBooleanAttribute(prefsA.hasWorm, attrsB.hasWorm);
  breakdown.shineFactor = scoreShineFactorAttribute(
    prefsA.shineFactor,
    attrsB.shineFactor
  );
  breakdown.hasChemicals = scoreBooleanAttribute(
    prefsA.hasChemicals,
    attrsB.hasChemicals
  );

  // Calculate average (equal weights)
  const scores = Object.values(breakdown);
  const score = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  return { score, breakdown };
}

// ============================================================================
// Match Score Computation
// ============================================================================

export interface FruitData {
  attributes: FruitAttributes;
  preferences: FruitPreferences;
}

/**
 * Compute full match scores for an apple-orange pair.
 * Returns both directional scores and the overall average.
 */
export function computeMatchScores(
  apple: FruitData,
  orange: FruitData
): DetailedMatchScores {
  // Apple's preferences vs Orange's attributes
  const appleOnOrangeResult = scoreFruitPreferences(
    apple.preferences,
    orange.attributes
  );

  // Orange's preferences vs Apple's attributes
  const orangeOnAppleResult = scoreFruitPreferences(
    orange.preferences,
    apple.attributes
  );

  const scoreAppleOnOrange = appleOnOrangeResult.score;
  const scoreOrangeOnApple = orangeOnAppleResult.score;
  const overallScore = (scoreAppleOnOrange + scoreOrangeOnApple) / 2;

  return {
    scoreAppleOnOrange,
    scoreOrangeOnApple,
    overallScore,
    breakdown: {
      appleOnOrange: appleOnOrangeResult.breakdown,
      orangeOnApple: orangeOnAppleResult.breakdown,
    },
  };
}
