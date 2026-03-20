export type BeltRank = {
  name: string;
  color: string;
  emoji: string;
  minScore: number;
  maxScore: number;
};

export const BELT_RANKS: BeltRank[] = [
  { name: "White Belt", color: "#F5F5F5", emoji: "⬜", minScore: 0.0, maxScore: 1.9 },
  { name: "Yellow Belt", color: "#FFD700", emoji: "🟡", minScore: 2.0, maxScore: 3.4 },
  { name: "Orange Belt", color: "#FF8C00", emoji: "🟠", minScore: 3.5, maxScore: 4.4 },
  { name: "Green Belt", color: "#2E8B57", emoji: "🟢", minScore: 4.5, maxScore: 5.4 },
  { name: "Blue Belt", color: "#4169E1", emoji: "🔵", minScore: 5.5, maxScore: 6.4 },
  { name: "Purple Belt", color: "#7B2D8E", emoji: "🟣", minScore: 6.5, maxScore: 7.4 },
  { name: "Brown Belt", color: "#8B4513", emoji: "🟤", minScore: 7.5, maxScore: 8.4 },
  { name: "Black Belt", color: "#1A1A1A", emoji: "⚫", minScore: 8.5, maxScore: 9.4 },
  { name: "Red Belt", color: "#DC143C", emoji: "🔴", minScore: 9.5, maxScore: 10.0 },
];

export function getBeltRank(avgRating: number): { name: string; color: string; emoji: string } {
  for (let i = BELT_RANKS.length - 1; i >= 0; i--) {
    if (avgRating >= BELT_RANKS[i].minScore) {
      return {
        name: BELT_RANKS[i].name,
        color: BELT_RANKS[i].color,
        emoji: BELT_RANKS[i].emoji,
      };
    }
  }
  return { name: BELT_RANKS[0].name, color: BELT_RANKS[0].color, emoji: BELT_RANKS[0].emoji };
}
