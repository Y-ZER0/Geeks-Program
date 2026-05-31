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
 * Calculate timeframe scores from score history using fixed periods
 * @param {Array} scoreHistory - Array of { timestamp, ai, cyber, web } objects
 * @param {String} type - 'w2' for 14-day periods, 'mo' for calendar months
 * @returns {Object} { AI, Cy, Wb } - Sum of scores within the current period
 */
export const calculateTimeframeScores = (scoreHistory = [], type) => {
  if (!scoreHistory || scoreHistory.length === 0) {
    return { AI: 0, Cy: 0, Wb: 0 };
  }

  const now = new Date();

  let periodStart, periodEnd;

  if (type === 'w2') {
    const epoch = new Date('2026-01-05T00:00:00Z');
    const msSinceEpoch = now - epoch;
    const periodMs = 14 * 24 * 60 * 60 * 1000;
    const currentPeriod = Math.floor(msSinceEpoch / periodMs);
    periodStart = new Date(epoch.getTime() + currentPeriod * periodMs);
    periodEnd = new Date(periodStart.getTime() + periodMs);
  } else if (type === 'mo') {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else {
    return { AI: 0, Cy: 0, Wb: 0 };
  }

  const filtered = scoreHistory.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= periodStart && entryDate < periodEnd;
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
