"use client";
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { clsx } from "clsx";

interface FeedbackProps {
  slug: string;
}

export function Feedback({ slug }: FeedbackProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  function handleVote(vote: "up" | "down") {
    setVoted(vote);
    // In production: POST to analytics endpoint
    // fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ slug, vote }) })
  }

  return (
    <div className="mt-10 pt-8 border-t border-white/[0.07]">
      {voted ? (
        <p className="text-sm text-zinc-500">
          Thanks for your feedback!{" "}
          <span className="text-brand-400">{voted === "up" ? "👍" : "👎"}</span>
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <p className="text-sm text-zinc-500">Was this page helpful?</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote("up")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-all",
                "border-white/[0.07] text-zinc-500 hover:border-brand-500/30 hover:text-brand-400 hover:bg-brand-500/5"
              )}
              aria-label="Yes, this page was helpful"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Yes
            </button>
            <button
              onClick={() => handleVote("down")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-mono transition-all",
                "border-white/[0.07] text-zinc-500 hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5"
              )}
              aria-label="No, this page needs improvement"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
