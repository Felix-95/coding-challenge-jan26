"use client";

import { useState } from "react";
import type { Fruit, FruitAttributes, FruitPreferences, ShineFactor, NumberRange } from "../types";
import type { DetailedMatchScores } from "@/lib/matchingScorer";

interface FruitCardProps {
  fruit: Fruit;
  isSelected: boolean;
  isExpanded?: boolean; // External expansion control (for primary side)
  onClick: () => void;
  matchScores?: DetailedMatchScores;
  isPrimarySide: boolean; // Whether this card is on the primary (left) or secondary (right) side
  comparingFruitPreferences?: FruitPreferences; // Preferences of the fruit we're comparing against
}

export function FruitCard({ 
  fruit, 
  isSelected, 
  isExpanded: externalIsExpanded,
  onClick, 
  matchScores, 
  isPrimarySide,
  comparingFruitPreferences 
}: FruitCardProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const { id, type, attributes, preferences } = fruit;

  // Use external expansion state for primary side, internal for secondary side
  const isExpanded = isPrimarySide ? (externalIsExpanded ?? false) : internalIsExpanded;

  // Format ID for display (remove the "apple:" or "orange:" prefix)
  const displayId = id.split(":")[1]?.slice(0, 8) || id;

  // Format attribute values
  const formatSize = (size: number | null | undefined) => 
    size != null ? size.toFixed(1) : "N/A";
  
  const formatWeight = (weight: number | null | undefined) => 
    weight != null ? `${weight.toFixed(0)}g` : "N/A";

  const formatShine = (shine: ShineFactor | null | undefined) => {
    if (!shine) return "N/A";
    const shineMap: Record<ShineFactor, string> = {
      dull: "Dull",
      neutral: "Neutral",
      shiny: "Shiny",
      extraShiny: "Extra Shiny",
    };
    return shineMap[shine];
  };

  const formatBoolean = (value: boolean | null | undefined) => {
    if (value == null) return "N/A";
    return value ? "Yes" : "No";
  };

  const formatNumberRange = (range: NumberRange | undefined) => {
    if (!range) return "Any";
    if (range.min != null && range.max != null) {
      return `${range.min.toFixed(1)} - ${range.max.toFixed(1)}`;
    }
    if (range.min != null) return `≥ ${range.min.toFixed(1)}`;
    if (range.max != null) return `≤ ${range.max.toFixed(1)}`;
    return "Any";
  };

  const formatShinePreference = (shine: ShineFactor | ShineFactor[] | undefined) => {
    if (!shine) return "Any";
    if (Array.isArray(shine)) {
      return shine.map(s => formatShine(s)).join(", ");
    }
    return formatShine(shine);
  };

  const formatBooleanPreference = (value: boolean | undefined) => {
    if (value === undefined) return "Any";
    return value ? "Yes" : "No";
  };

  // Helper to check if a preference has a meaningful value
  const hasPreferenceValue = (key: keyof FruitPreferences): boolean => {
    const value = preferences[key];
    if (value === undefined) return false;
    
    // For NumberRange, check if min or max is defined
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      const range = value as NumberRange;
      return range.min !== undefined || range.max !== undefined;
    }
    
    // For arrays (shineFactor can be array)
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    // For other values (boolean, string), they're defined
    return true;
  };

  // Get only preferences with values for THIS fruit
  const activePreferences = (Object.keys(preferences) as Array<keyof FruitPreferences>)
    .filter(hasPreferenceValue);

  // Get only preferences with values for the COMPARING fruit (if provided)
  const comparingActivePreferences = comparingFruitPreferences 
    ? (Object.keys(comparingFruitPreferences) as Array<keyof FruitPreferences>)
        .filter(key => {
          const value = comparingFruitPreferences[key];
          if (value === undefined) return false;
          
          // For NumberRange, check if min or max is defined
          if (typeof value === "object" && !Array.isArray(value) && value !== null) {
            const range = value as NumberRange;
            return range.min !== undefined || range.max !== undefined;
          }
          
          // For arrays (shineFactor can be array)
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          
          // For other values (boolean, string), they're defined
          return true;
        })
    : [];

  const handleCardClick = (e: React.MouseEvent) => {
    if (isPrimarySide) {
      // Primary side: clicking triggers selection (expansion controlled externally)
      onClick();
    } else {
      // Secondary side: clicking only expands/collapses (internal state)
      setInternalIsExpanded(!internalIsExpanded);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        cursor-pointer rounded-xl border-2 p-4 transition-all duration-300
        hover:shadow-xl backdrop-blur-sm
        ${
          isSelected
            ? type === "apple"
              ? "border-red-400 bg-red-500/20 shadow-xl ring-2 ring-red-500/50"
              : "border-orange-400 bg-orange-500/20 shadow-xl ring-2 ring-orange-500/50"
            : "border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15"
        }
      `}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{type === "apple" ? "🍎" : "🍊"}</span>
          <span className="font-mono text-xs text-white/60">#{displayId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/60">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
      </div>

      {/* Compact View - Always Visible */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-white/60">Size:</span>{" "}
            <span className="font-semibold text-white">{formatSize(attributes.size)}</span>
          </div>
          <div>
            <span className="text-white/60">Weight:</span>{" "}
            <span className="font-semibold text-white">{formatWeight(attributes.weight)}</span>
          </div>
          <div>
            <span className="text-white/60">Shine:</span>{" "}
            <span className="font-semibold text-white">{formatShine(attributes.shineFactor)}</span>
          </div>
          <div>
            <span className="text-white/60">Worm:</span>{" "}
            <span className="font-semibold text-white">{formatBoolean(attributes.hasWorm)}</span>
          </div>
        </div>
      </div>

      {/* Match Scores - Visible when matchScores are provided */}
      {matchScores && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Match Quality
              </span>
              <span className="text-xs text-white/60">
                {(matchScores.overallScore * 100).toFixed(0)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-white/60 mb-1">
                  {type === "apple" ? "🍎 → 🍊" : "🍊 → 🍎"}
                </div>
                <div className="font-bold text-white">
                  {type === "apple" 
                    ? (matchScores.scoreAppleOnOrange * 100).toFixed(0)
                    : (matchScores.scoreOrangeOnApple * 100).toFixed(0)
                  }%
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-2">
                <div className="text-white/60 mb-1">
                  {type === "apple" ? "🍊 → 🍎" : "🍎 → 🍊"}
                </div>
                <div className="font-bold text-white">
                  {type === "apple" 
                    ? (matchScores.scoreOrangeOnApple * 100).toFixed(0)
                    : (matchScores.scoreAppleOnOrange * 100).toFixed(0)
                  }%
                </div>
              </div>
            </div>
            {/* Overall Score Bar */}
            <div className="mt-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div 
                  className={`h-full transition-all duration-500 ${
                    matchScores.overallScore >= 0.7 
                      ? "bg-green-500" 
                      : matchScores.overallScore >= 0.4 
                      ? "bg-yellow-500" 
                      : "bg-red-500"
                  }`}
                  style={{ width: `${matchScores.overallScore * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded View - Full Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
          {/* Match Score Breakdown - Show when matchScores are available */}
          {matchScores && (
            <div>
              <h4 className="mb-2 text-sm font-bold text-white">🎯 Match Breakdown</h4>
              <div className="space-y-3">
                {/* Directional Scores */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* From comparing fruit's perspective (the one we selected on left) */}
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="mb-1 font-semibold text-white/80">
                      {type === "apple" ? "Orange → Apple" : "Apple → Orange"}
                    </div>
                    <div className="mb-2 text-xl font-bold text-white">
                      {type === "apple" 
                        ? (matchScores.scoreOrangeOnApple * 100).toFixed(1)
                        : (matchScores.scoreAppleOnOrange * 100).toFixed(1)
                      }%
                    </div>
                    <div className="space-y-1">
                      {/* Show only attributes that the COMPARING fruit (left side) has preferences for */}
                      {comparingActivePreferences.length > 0 ? (
                        comparingActivePreferences.map((attr) => {
                          const breakdown = type === "apple" 
                            ? matchScores.breakdown.orangeOnApple 
                            : matchScores.breakdown.appleOnOrange;
                          const score = breakdown[attr as string];
                          
                          const label = {
                            size: "size",
                            weight: "weight",
                            hasStem: "hasStem",
                            hasLeaf: "hasLeaf",
                            hasWorm: "hasWorm",
                            shineFactor: "shineFactor",
                            hasChemicals: "hasChemicals",
                          }[attr];
                          
                          return (
                            <div key={attr} className="flex items-center justify-between text-[10px]">
                              <span className="text-white/60">{label}:</span>
                              <span className={`font-semibold ${
                                score === 1 ? "text-green-400" : 
                                score === 0 ? "text-red-400" : "text-yellow-400"
                              }`}>
                                {(score * 100).toFixed(0)}%
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-white/50 italic">No preferences</p>
                      )}
                    </div>
                  </div>

                  {/* From this fruit's perspective */}
                  <div className="rounded-lg bg-white/5 p-2">
                    <div className="mb-1 font-semibold text-white/80">
                      {type === "apple" ? "Apple → Orange" : "Orange → Apple"}
                    </div>
                    <div className="mb-2 text-xl font-bold text-white">
                      {type === "apple" 
                        ? (matchScores.scoreAppleOnOrange * 100).toFixed(1)
                        : (matchScores.scoreOrangeOnApple * 100).toFixed(1)
                      }%
                    </div>
                    <div className="space-y-1">
                      {/* Only show attributes that THIS fruit has preferences for */}
                      {activePreferences.length > 0 ? (
                        activePreferences.map((attr) => {
                          const breakdown = type === "apple" 
                            ? matchScores.breakdown.appleOnOrange 
                            : matchScores.breakdown.orangeOnApple;
                          const score = breakdown[attr as string];
                          
                          const label = {
                            size: "size",
                            weight: "weight",
                            hasStem: "hasStem",
                            hasLeaf: "hasLeaf",
                            hasWorm: "hasWorm",
                            shineFactor: "shineFactor",
                            hasChemicals: "hasChemicals",
                          }[attr];
                          
                          return (
                            <div key={attr} className="flex items-center justify-between text-[10px]">
                              <span className="text-white/60">{label}:</span>
                              <span className={`font-semibold ${
                                score === 1 ? "text-green-400" : 
                                score === 0 ? "text-red-400" : "text-yellow-400"
                              }`}>
                                {(score * 100).toFixed(0)}%
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[10px] text-white/50 italic">No preferences</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Attributes */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-white">📋 All Attributes</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/60">Size:</span>{" "}
                <span className="font-semibold text-white">{formatSize(attributes.size)}</span>
              </div>
              <div>
                <span className="text-white/60">Weight:</span>{" "}
                <span className="font-semibold text-white">{formatWeight(attributes.weight)}</span>
              </div>
              <div>
                <span className="text-white/60">Has Stem:</span>{" "}
                <span className="font-semibold text-white">{formatBoolean(attributes.hasStem)}</span>
              </div>
              <div>
                <span className="text-white/60">Has Leaf:</span>{" "}
                <span className="font-semibold text-white">{formatBoolean(attributes.hasLeaf)}</span>
              </div>
              <div>
                <span className="text-white/60">Has Worm:</span>{" "}
                <span className="font-semibold text-white">{formatBoolean(attributes.hasWorm)}</span>
              </div>
              <div>
                <span className="text-white/60">Shine:</span>{" "}
                <span className="font-semibold text-white">{formatShine(attributes.shineFactor)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-white/60">Has Chemicals:</span>{" "}
                <span className="font-semibold text-white">{formatBoolean(attributes.hasChemicals)}</span>
              </div>
            </div>
          </div>

          {/* Preferences - What it's looking for */}
          <div>
            <h4 className="mb-2 text-sm font-bold text-white">💭 Looking For</h4>
            {activePreferences.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {activePreferences.map((key) => {
                  const label = {
                    size: "Size",
                    weight: "Weight",
                    hasStem: "Has Stem",
                    hasLeaf: "Has Leaf",
                    hasWorm: "Has Worm",
                    shineFactor: "Shine",
                    hasChemicals: "Has Chemicals",
                  }[key];

                  let value: string;
                  if (key === "size" || key === "weight") {
                    value = formatNumberRange(preferences[key]);
                  } else if (key === "shineFactor") {
                    value = formatShinePreference(preferences[key]);
                  } else {
                    value = formatBooleanPreference(preferences[key] as boolean | undefined);
                  }

                  return (
                    <div key={key}>
                      <span className="text-white/60">{label}:</span>{" "}
                      <span className="font-semibold text-white">{value}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/60 italic">No specific preferences</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
