"use client";

import Link from "next/link";
import { BeltBadge } from "./BeltBadge";

type Suite = {
  slug: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  avg_rating: number;
  rating_count: number;
  download_count: number;
  publisher_name: string | null;
  publisher_avatar: string | null;
  belt: { name: string; color: string; emoji: string };
  tags: string[];
};

const categoryColors: Record<string, string> = {
  sales: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  support: "bg-green-500/15 text-green-300 border-green-500/25",
  dev: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  content: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  fun: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  general: "bg-gray-500/15 text-gray-300 border-gray-500/25",
};

export function SuiteCard({ suite }: { suite: Suite }) {
  return (
    <Link href={`/marketplace/${suite.slug}`}>
      <div className="group h-full p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#d4a574]/30 transition-all duration-300 cursor-pointer">
        {/* Name + Category */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-[#e8e4df] leading-tight">{suite.name}</h3>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap ${
              categoryColors[suite.category] || categoryColors.general
            }`}
          >
            {suite.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-[#e8e4df]/40 text-sm leading-relaxed mb-4 line-clamp-2">
          {suite.description}
        </p>

        {/* Belt Badge */}
        <div className="mb-3">
          <BeltBadge name={suite.belt.name} color={suite.belt.color} size="sm" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-[#e8e4df]/50 mb-3">
          <span className="font-semibold text-[#d4a574]">
            {suite.avg_rating.toFixed(1)} / 10
          </span>
          <span>{suite.rating_count} votes</span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {suite.download_count}
          </span>
        </div>

        {/* Publisher */}
        <div className="flex items-center gap-2 text-xs text-[#e8e4df]/30">
          {suite.publisher_avatar ? (
            <img src={suite.publisher_avatar} alt="" className="w-4 h-4 rounded-full" />
          ) : (
            <span className="w-4 h-4 rounded-full bg-[#d4a574]/20 flex items-center justify-center text-[8px]">
              🥋
            </span>
          )}
          <span>{suite.publisher_name || "Sensei Official"}</span>
        </div>
      </div>
    </Link>
  );
}
