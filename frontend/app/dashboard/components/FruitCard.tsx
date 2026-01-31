"use client";

import { useState } from "react";
import type { Fruit, FruitAttributes, FruitPreferences, ShineFactor, NumberRange } from "../types";

interface FruitCardProps {
  fruit: Fruit;
  isSelected: boolean;
  onClick: () => void;
}

export function FruitCard({ fruit, isSelected, onClick }: FruitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { id, type, attributes, preferences } = fruit;

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

  // Get only preferences with values
  const activePreferences = (Object.keys(preferences) as Array<keyof FruitPreferences>)
    .filter(hasPreferenceValue);

  const handleCardClick = (e: React.MouseEvent) => {
    // Toggle expanded state
    setIsExpanded(!isExpanded);
    // Also trigger selection
    onClick();
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
          {isSelected && (
            <span className="rounded-full bg-lime-500 px-2 py-0.5 text-xs font-semibold text-zinc-900">
              Selected
            </span>
          )}
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

      {/* Expanded View - Full Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
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
              <div className="space-y-1.5 text-sm">
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
                    <div key={key} className="flex justify-between">
                      <span className="text-white/60">{label}:</span>
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
