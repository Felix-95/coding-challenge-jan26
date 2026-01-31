"use client";

import { useEffect } from "react";
import { useMatchmakingStore } from "@/lib/store";
import type { MatchingAlgorithm } from "../loader";

interface AlgorithmSelectorProps {
  algorithms: MatchingAlgorithm[];
}

export function AlgorithmSelector({ algorithms }: AlgorithmSelectorProps) {
  const selectedKey = useMatchmakingStore((s) => s.selectedAlgorithmKey);
  const setSelectedKey = useMatchmakingStore((s) => s.setSelectedAlgorithmKey);

  // Auto-select the first algorithm if none is selected
  useEffect(() => {
    if (!selectedKey && algorithms.length > 0) {
      setSelectedKey(algorithms[0].key);
    }
  }, [selectedKey, algorithms, setSelectedKey]);

  if (algorithms.length === 0) {
    return null;
  }

  return (
    <select
      value={selectedKey ?? ""}
      onChange={(e) => setSelectedKey(e.target.value)}
      className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/15 focus:border-white/40 focus:outline-none"
    >
      {algorithms.map((algo) => (
        <option key={algo.key} value={algo.key} className="bg-zinc-900 text-white">
          {algo.name} v{algo.version}
        </option>
      ))}
    </select>
  );
}
