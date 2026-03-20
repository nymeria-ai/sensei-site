"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { BeltBadge } from "./BeltBadge";
import { getBeltRank, BELT_RANKS } from "@/lib/belt-ranks";

export function RatingSlider({
  slug,
  onRated,
}: {
  slug: string;
  onRated?: () => void;
}) {
  const { data: session } = useSession();
  const [score, setScore] = useState(7);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const belt = getBeltRank(score);

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketplace/suites/${slug}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      if (res.ok) {
        setSubmitted(true);
        onRated?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-[#e8e4df]/50 text-sm mb-3">Sign in to rate this suite</p>
        <a
          href="/api/auth/signin"
          className="inline-block px-5 py-2 text-sm font-medium rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors"
        >
          Sign in to rate
        </a>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-[#4ade80] font-medium mb-1">Rating submitted!</p>
        <p className="text-[#e8e4df]/40 text-sm">
          You gave this suite a {score}/10
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
      <h3 className="font-bold mb-4">Rate this Suite</h3>

      {/* Score display */}
      <div className="text-center mb-4">
        <span className="text-4xl font-bold text-[#d4a574]">{score}</span>
        <span className="text-lg text-[#e8e4df]/40"> / 10</span>
      </div>

      {/* Belt preview */}
      <div className="flex justify-center mb-4">
        <BeltBadge name={belt.name} color={belt.color} size="md" />
      </div>

      {/* Slider */}
      <div className="mb-4">
        <input
          type="range"
          min={1}
          max={10}
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="w-full accent-[#d4a574] cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-[#e8e4df]/30 mt-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {/* Belt scale */}
      <div className="flex gap-0.5 mb-4">
        {BELT_RANKS.map((b) => (
          <div
            key={b.name}
            className="flex-1 h-1.5 rounded-full transition-opacity"
            style={{
              backgroundColor: b.color,
              opacity: score >= b.minScore && score <= b.maxScore ? 1 : 0.2,
            }}
          />
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-2.5 text-sm font-semibold rounded-lg bg-[#d4a574] text-[#0a0a0a] hover:bg-[#c9956b] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "Submitting..." : "Submit Rating"}
      </button>
    </div>
  );
}
