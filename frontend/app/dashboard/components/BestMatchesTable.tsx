"use client";

import { useState } from "react";
import type { BestMatch } from "../loader";
import { MessageBubble } from "./MessageBubble";

interface BestMatchesTableProps {
  matches: BestMatch[];
}

export function BestMatchesTable({ matches }: BestMatchesTableProps) {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const toggleExpanded = (matchId: string) => {
    setExpandedMatchId(expandedMatchId === matchId ? null : matchId);
  };

  if (matches.length === 0) {
    return (
      <div className="card mt-6">
        <div className="px-4 py-8 text-center text-sm text-white/60">
          No matches yet. Start a new conversation to create your first pear!
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-6 divide-y divide-white/5">
      {matches.map((match) => {
        const isExpanded = expandedMatchId === match.id;
        const hasMessages = match.messageToIncoming || match.messageToExisting;

        const appleShortId = match.appleId.split(":")[1]?.substring(0, 8) || "N/A";
        const orangeShortId = match.orangeId.split(":")[1]?.substring(0, 8) || "N/A";

        // Messages are from the organization to each fruit.
        // Assign by recipient, not by incoming/existing direction.
        const appleMessage =
          match.incomingKind === "apple"
            ? match.messageToIncoming
            : match.messageToExisting;
        const orangeMessage =
          match.incomingKind === "orange"
            ? match.messageToIncoming
            : match.messageToExisting;

        return (
          <div key={match.id}>
            {/* Clickable row */}
            <div
              onClick={() => hasMessages && toggleExpanded(match.id)}
              className={`
                flex items-center gap-4 px-4 py-3 transition-colors
                ${hasMessages ? "cursor-pointer hover:bg-white/5" : ""}
                ${isExpanded ? "bg-white/5" : ""}
              `}
            >
              {/* Expand arrow */}
              <span
                className="w-5 text-sm text-white/60 transition-transform duration-200 inline-block flex-shrink-0"
                style={{
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                  visibility: hasMessages ? "visible" : "hidden",
                }}
              >
                ▶
              </span>

              {/* Incoming type */}
              <span className="text-sm text-white/90 w-24 flex-shrink-0">
                {match.incomingKind === "apple" ? "🍎 Apple" : "🍊 Orange"}
              </span>

              {/* Apple ID */}
              <span className="text-sm font-mono text-white/70 w-20 flex-shrink-0">
                {appleShortId}
              </span>

              {/* Orange ID */}
              <span className="text-sm font-mono text-white/70 w-20 flex-shrink-0">
                {orangeShortId}
              </span>

              {/* Score badge */}
              <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400 flex-shrink-0">
                {(match.overallScore * 100).toFixed(1)}%
              </span>

              {/* Status */}
              <span className="text-sm text-white/70 capitalize w-20 flex-shrink-0">
                {match.status}
              </span>

              {/* Date */}
              <span className="text-sm text-white/60 ml-auto flex-shrink-0">
                {new Date(match.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Expanded message panel */}
            {isExpanded && hasMessages && (
              <div className="px-4 py-6 bg-white/[0.02]">
                <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
                  {/* Left — Apple side */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
                      Apple
                    </div>
                    {appleMessage ? (
                      <MessageBubble
                        message={appleMessage}
                        sender="apple"
                        senderLabel={`to ${appleShortId}`}
                      />
                    ) : (
                      <div className="text-sm text-white/40 italic">No message</div>
                    )}
                  </div>

                  {/* Right — Orange side */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">
                      Orange
                    </div>
                    {orangeMessage ? (
                      <MessageBubble
                        message={orangeMessage}
                        sender="orange"
                        senderLabel={`to ${orangeShortId}`}
                      />
                    ) : (
                      <div className="text-sm text-white/40 italic">No message</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
