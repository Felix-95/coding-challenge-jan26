interface MessageBubbleProps {
  message: string;
  sender: "apple" | "orange";
  senderLabel: string;
}

export function MessageBubble({ message, sender, senderLabel }: MessageBubbleProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Emoji Icon */}
      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
        <span className="text-lg">{sender === "apple" ? "🍎" : "🍊"}</span>
      </div>
      
      {/* Message Bubble */}
      <div className="flex-1 max-w-lg">
        {/* Sender Label */}
        <div className="mb-1 text-xs font-medium text-white/60">
          {senderLabel}
        </div>
        
        {/* Message Content */}
        <div className={`
          rounded-2xl px-4 py-3 text-sm text-white shadow-lg
          ${sender === "apple" 
            ? "bg-red-500/20 border border-red-500/30" 
            : "bg-orange-500/20 border border-orange-500/30"
          }
        `}>
          {message}
        </div>
      </div>
    </div>
  );
}
