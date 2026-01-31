"use client";

import { useState, useMemo } from "react";
import type { Apple, Orange, Fruit } from "../types";
import { FruitCard } from "./FruitCard";
import { computeMatchScores, type DetailedMatchScores } from "@/lib/matchingScorer";

interface FruitColumnsProps {
  apples: Apple[];
  oranges: Orange[];
}

interface FruitWithMatchScore extends Fruit {
  matchScores?: DetailedMatchScores;
}

type ComparisonMode = "apple" | "orange";

export function FruitColumns({ apples, oranges }: FruitColumnsProps) {
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("apple");
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<string | null>(null);
  const [expandedPrimaryId, setExpandedPrimaryId] = useState<string | null>(null);

  // Handle click on primary side (left column) - triggers match search AND manages expansion
  const handlePrimaryClick = (fruitId: string) => {
    // If clicking the same item that's already selected
    if (selectedPrimaryId === fruitId) {
      // Toggle expanded state
      setExpandedPrimaryId((current) => (current === fruitId ? null : fruitId));
    } else {
      // Selecting a new item: select it and expand it
      setSelectedPrimaryId(fruitId);
      setExpandedPrimaryId(fruitId);
    }
  };

  // Handle click on secondary side (right column) - only expands/collapses, no match search
  // This is handled entirely within FruitCard component

  // Find the selected primary fruit
  const selectedPrimaryFruit = useMemo(() => {
    if (!selectedPrimaryId) return null;
    
    if (comparisonMode === "apple") {
      const apple = apples.find((a) => a.id === selectedPrimaryId);
      return apple ? { fruit: apple, type: "apple" as const } : null;
    } else {
      const orange = oranges.find((o) => o.id === selectedPrimaryId);
      return orange ? { fruit: orange, type: "orange" as const } : null;
    }
  }, [selectedPrimaryId, comparisonMode, apples, oranges]);

  // Compute and sort matches when a primary fruit is selected
  const { primaryFruits, secondaryFruits } = useMemo(() => {
    if (comparisonMode === "apple") {
      // Apple mode: apples on left, oranges on right
      if (!selectedPrimaryFruit) {
        return { primaryFruits: apples, secondaryFruits: oranges };
      }

      // Score and sort oranges based on selected apple
      const orangesWithScores: FruitWithMatchScore[] = oranges.map((orange) => ({
        ...orange,
        matchScores: computeMatchScores(selectedPrimaryFruit.fruit, orange),
      }));

      // Sort by overall score (descending)
      orangesWithScores.sort((a, b) => 
        (b.matchScores?.overallScore ?? 0) - (a.matchScores?.overallScore ?? 0)
      );

      return { primaryFruits: apples, secondaryFruits: orangesWithScores };
    } else {
      // Orange mode: oranges on left, apples on right
      if (!selectedPrimaryFruit) {
        return { primaryFruits: oranges, secondaryFruits: apples };
      }

      // Score and sort apples based on selected orange
      const applesWithScores: FruitWithMatchScore[] = apples.map((apple) => ({
        ...apple,
        matchScores: computeMatchScores(apple, selectedPrimaryFruit.fruit),
      }));

      // Sort by overall score (descending)
      applesWithScores.sort((a, b) => 
        (b.matchScores?.overallScore ?? 0) - (a.matchScores?.overallScore ?? 0)
      );

      return { primaryFruits: oranges, secondaryFruits: applesWithScores };
    }
  }, [comparisonMode, selectedPrimaryFruit, apples, oranges]);

  // Determine column labels based on mode
  const primaryLabel = comparisonMode === "apple" ? "🍎 Apples" : "🍊 Oranges";
  const secondaryLabel = comparisonMode === "apple" ? "🍊 Oranges" : "🍎 Apples";
  const primaryCount = comparisonMode === "apple" ? apples.length : oranges.length;
  const secondaryCount = comparisonMode === "apple" ? oranges.length : apples.length;
  const primaryType = comparisonMode;
  const secondaryType = comparisonMode === "apple" ? "orange" : "apple";

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 p-1 backdrop-blur-sm">
          <button
            onClick={() => {
              setComparisonMode("apple");
              setSelectedPrimaryId(null); // Clear selection when switching modes
              setExpandedPrimaryId(null); // Clear expansion when switching modes
            }}
            className={`
              rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200
              ${
                comparisonMode === "apple"
                  ? "bg-red-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }
            `}
          >
            🍎 Apple Mode
          </button>
          <button
            onClick={() => {
              setComparisonMode("orange");
              setSelectedPrimaryId(null); // Clear selection when switching modes
              setExpandedPrimaryId(null); // Clear expansion when switching modes
            }}
            className={`
              rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200
              ${
                comparisonMode === "orange"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }
            `}
          >
            🍊 Orange Mode
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-white/60">
        {comparisonMode === "apple" ? (
          <p>Select an apple to see its best orange matches →</p>
        ) : (
          <p>Select an orange to see its best apple matches →</p>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-12">
        {/* Primary Column (Left) */}
        <div className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <span>{primaryLabel}</span>
              <span className="text-xs font-normal text-white/50">(Click to compare)</span>
            </h3>
            <span className={`
              rounded-full px-4 py-1.5 text-sm font-medium
              ${
                comparisonMode === "apple"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              }
            `}>
              {primaryCount}
            </span>
          </div>
          <div className="space-y-4">
            {primaryFruits.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                <div>
                  <p className="text-muted">No {primaryType}s yet</p>
                  <p className="mt-1 text-sm text-muted">
                    Click &quot;Run Matching&quot; to add some!
                  </p>
                </div>
              </div>
            ) : (
              primaryFruits.map((fruit) => (
                <FruitCard
                  key={fruit.id}
                  fruit={fruit}
                  isSelected={selectedPrimaryId === fruit.id}
                  isExpanded={expandedPrimaryId === fruit.id}
                  onClick={() => handlePrimaryClick(fruit.id)}
                  matchScores={undefined} // Primary fruits don't show match scores
                  isPrimarySide={true}
                  comparingFruitPreferences={undefined}
                />
              ))
            )}
          </div>
        </div>

        {/* Secondary Column (Right) - Matches */}
        <div className="flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <span>{secondaryLabel}</span>
              <span className="text-xs font-normal text-white/50">
                {selectedPrimaryId ? "(Best matches)" : "(Click to view details)"}
              </span>
            </h3>
            <span className={`
              rounded-full px-4 py-1.5 text-sm font-medium
              ${
                comparisonMode === "apple"
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }
            `}>
              {secondaryCount}
            </span>
          </div>
          <div className="space-y-4">
            {secondaryFruits.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
                <div>
                  <p className="text-muted">No {secondaryType}s yet</p>
                  <p className="mt-1 text-sm text-muted">
                    Click &quot;Run Matching&quot; to add some!
                  </p>
                </div>
              </div>
            ) : (
              secondaryFruits.map((fruit) => (
                <FruitCard
                  key={fruit.id}
                  fruit={fruit}
                  isSelected={false} // Secondary side fruits are never "selected"
                  onClick={() => {}} // Secondary side clicks are handled internally by FruitCard
                  matchScores={(fruit as FruitWithMatchScore).matchScores}
                  isPrimarySide={false}
                  comparingFruitPreferences={selectedPrimaryFruit?.fruit.preferences}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
