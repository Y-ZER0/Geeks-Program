/**
 * Formatting Utilities
 */

/**
 * Format number with locale commas (e.g., 1000 → "1,000")
 */
export const fmt = (n) => n.toLocaleString();

/**
 * Pad number with leading zero (e.g., 5 → "05")
 */
export const pad = (n) => String(n).padStart(2, "0");

/**
 * Format seconds into human-readable countdown (d h m s)
 */
export const formatCountdown = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hrs = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return {
    days,
    hrs,
    mins,
    secs,
    formatted: `${days}d ${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`,
  };
};

/**
 * Format time as HH:MM
 */
export const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
