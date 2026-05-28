/**
 * Scoring & Categories
 */

export const TIMEFRAMES = [
  { key: "live", label: "Live Score" },
  { key: "w2", label: "2 Weeks" },
  { key: "mo", label: "Monthly" },
];

export const CATEGORIES = [
  { key: "All", label: "Overall", icon: "Star" },
  { key: "AI", label: "AI", icon: "Brain" },
  { key: "Cy", label: "Cybersecurity", icon: "Shield" },
  { key: "Wb", label: "Web Dev", icon: "Code" },
];

/**
 * Calculate player score for a specific timeframe and category
 * @param {Object} player - Player object
 * @param {String} tf - Timeframe key (live, w2, mo)
 * @param {String} cat - Category key (All, AI, Cy, Wb)
 */
export const score = (p, tf, cat) => {
  const d = p.pts[tf];
  return cat === "All" ? d.AI + d.Cy + d.Wb : d[cat];
};

/**
 * Calculate rolling timeframe scores from score history
 * @param {Array} scoreHistory - Array of { timestamp, ai, cyber, web } objects
 * @param {Number} days - Number of days to include (14 for 2-week, 30 for monthly)
 * @returns {Object} { AI, Cy, Wb } - Sum of scores from last N days
 */
export const calculateTimeframeScores = (scoreHistory = [], days) => {
  if (!scoreHistory || scoreHistory.length === 0) {
    return { AI: 0, Cy: 0, Wb: 0 };
  }

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const filtered = scoreHistory.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= cutoffDate;
  });

  return filtered.reduce(
    (sum, entry) => ({
      AI: sum.AI + (entry.ai || 0),
      Cy: sum.Cy + (entry.cyber || 0),
      Wb: sum.Wb + (entry.web || 0),
    }),
    { AI: 0, Cy: 0, Wb: 0 }
  );
};
