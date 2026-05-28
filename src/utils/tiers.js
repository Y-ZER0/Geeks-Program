/**
 * Tier Definitions & Logic
 * 
 * Tier progression:
 *   Bronze 0-74 → Silver 75-149 → Gold 150-299 → 
 *   Platinum 300-599 → Geek 600-899 → Geeks Master 900+
 */

export const TIERS = [
  { min: 900, name: "Geeks Master", color: "#FFD883", glow: "rgba(255,216,131,0.55)", bg: "rgba(255,216,131,0.12)" },
  { min: 600, name: "Geek", color: "#C084FC", glow: "rgba(192,132,252,0.55)", bg: "rgba(192,132,252,0.12)" },
  { min: 300, name: "Platinum", color: "#A5F3FC", glow: "rgba(165,243,252,0.45)", bg: "rgba(165,243,252,0.10)" },
  { min: 150, name: "Gold", color: "#FFD700", glow: "rgba(255,215,0,0.50)", bg: "rgba(255,215,0,0.10)" },
  { min: 75, name: "Silver", color: "#D1D5DB", glow: "rgba(209,213,219,0.40)", bg: "rgba(209,213,219,0.10)" },
  { min: 0, name: "Bronze", color: "#CD7F32", glow: "rgba(205,127,50,0.45)", bg: "rgba(205,127,50,0.10)" },
];

/**
 * Get tier information for a given point total
 */
export const getTier = (pts) => TIERS.find(t => pts >= t.min) || TIERS[5];

/**
 * Calculate progress toward next tier
 */
export const getProgress = (pts) => {
  const steps = [75, 150, 300, 600, 900];
  const names = ["Silver", "Gold", "Platinum", "Geek", "Geeks Master"];
  
  for (let i = 0; i < steps.length; i++) {
    if (pts < steps[i]) {
      const prev = i === 0 ? 0 : steps[i - 1];
      return {
        next: names[i],
        pct: Math.round(((pts - prev) / (steps[i] - prev)) * 100),
        rem: steps[i] - pts,
      };
    }
  }
  return { next: "MAX", pct: 100, rem: 0 };
};
