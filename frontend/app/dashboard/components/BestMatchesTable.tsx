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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80 w-10" />
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Incoming</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Apple</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Orange</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Match Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Created At</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-white/60">
                  No matches yet. Start a new conversation to create your first pear!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80 w-10" />
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Incoming</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Apple</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Orange</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Match Score</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">Created At</th>
            </tr>
          </thead>
          {matches.map((match) => {
            const isExpanded = expandedMatchId === match.id;
            const hasMessages = match.messageToIncoming || match.messageToExisting;

            const appleShortId = match.appleId.split(":")[1]?.substring(0, 8) || "N/A";
            const orangeShortId = match.orangeId.split(":")[1]?.substring(0, 8) || "N/A";

            // Messages are from the organization to each fruit — assign by recipient.
            const appleMessage =
              match.incomingKind === "apple"
                ? match.messageToIncoming
                : match.messageToExisting;
            const orangeMessage =
              match.incomingKind === "orange"
                ? match.messageToIncoming
                : match.messageToExisting;

            return (
              <tbody key={match.id}>
                <tr
                  onClick={() => hasMessages && toggleExpanded(match.id)}
                  className={`
                    border-b border-white/5 transition-colors
                    ${hasMessages ? "cursor-pointer hover:bg-white/5" : ""}
                    ${isExpanded ? "bg-white/5" : ""}
                  `}
                >
                  <td className="px-4 py-3 text-sm text-white/60">
                    {hasMessages && (
                      <span
                        className="transition-transform duration-200 inline-block"
                        style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                      >
                        ▶
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/90">
                    {match.incomingKind === "apple" ? "🍎 Apple" : "🍊 Orange"}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-white/70">
                    {appleShortId}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-white/70">
                    {orangeShortId}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/90">
                    <span className="inline-flex items-center rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                      {(match.overallScore * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70 capitalize">
                    {match.status}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/60">
                    {(() => {
                      const d = new Date(match.createdAt);
                      return isNaN(d.getTime()) ? match.createdAt || "—" : d.toISOString().replace("T", " ").slice(0, 19);
                    })()}
                  </td>
                </tr>

                {isExpanded && hasMessages && (
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td colSpan={7} className="px-4 py-6">
                      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {/* Left — Apple side */}
                        <div className="space-y-2">
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
                    </td>
                  </tr>
                )}
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
}
