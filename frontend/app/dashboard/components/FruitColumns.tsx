"use client";

import { useState } from "react";
import type { Apple, Orange } from "../types";
import { FruitCard } from "./FruitCard";

interface FruitColumnsProps {
  apples: Apple[];
  oranges: Orange[];
}

export function FruitColumns({ apples, oranges }: FruitColumnsProps) {
  const [selectedFruitId, setSelectedFruitId] = useState<string | null>(null);

  const handleFruitClick = (fruitId: string) => {
    // Toggle selection: if already selected, deselect; otherwise select
    setSelectedFruitId((current) => (current === fruitId ? null : fruitId));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Apples Column */}
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <span>🍎</span>
            <span>Apples</span>
          </h3>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {apples.length}
          </span>
        </div>
        <div className="max-h-[600px] space-y-3 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          {apples.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-center">
              <div>
                <p className="text-muted">No apples yet</p>
                <p className="mt-1 text-sm text-muted">
                  Click &quot;Run Matching&quot; to add some!
                </p>
              </div>
            </div>
          ) : (
            apples.map((apple) => (
              <FruitCard
                key={apple.id}
                fruit={apple}
                isSelected={selectedFruitId === apple.id}
                onClick={() => handleFruitClick(apple.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Oranges Column */}
      <div className="flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <span>🍊</span>
            <span>Oranges</span>
          </h3>
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            {oranges.length}
          </span>
        </div>
        <div className="max-h-[600px] space-y-3 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          {oranges.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-center">
              <div>
                <p className="text-muted">No oranges yet</p>
                <p className="mt-1 text-sm text-muted">
                  Click &quot;Run Matching&quot; to add some!
                </p>
              </div>
            </div>
          ) : (
            oranges.map((orange) => (
              <FruitCard
                key={orange.id}
                fruit={orange}
                isSelected={selectedFruitId === orange.id}
                onClick={() => handleFruitClick(orange.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
