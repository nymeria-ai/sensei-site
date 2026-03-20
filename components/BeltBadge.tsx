"use client";

export function BeltBadge({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { dot: "w-2.5 h-2.5", text: "text-xs", px: "px-2.5 py-1" },
    md: { dot: "w-3 h-3", text: "text-sm", px: "px-3 py-1.5" },
    lg: { dot: "w-4 h-4", text: "text-base", px: "px-4 py-2" },
  };
  const s = sizes[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${s.px} rounded-full bg-white/5 border border-white/10 ${s.text} font-medium`}
      style={{ boxShadow: `0 0 12px ${color}40, 0 0 4px ${color}20` }}
    >
      <span
        className={`${s.dot} rounded-full`}
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      {name}
    </span>
  );
}
