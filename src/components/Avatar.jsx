/**
 * Avatar Component
 * Displays player avatar with tier-based glow effect
 * Color is auto-derived from player's tier (total points)
 */

import { getTier } from "../utils/tiers";

export function Avatar({ player, size = 40, pts }) {
  const tier = getTier(pts);
  
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      flexShrink: 0,
      background: `linear-gradient(135deg,${tier.color}22,${tier.color}55)`,
      border: `2px solid ${pts >= 900 ? "#FAA41A" : tier.color}99`,
      boxShadow: `0 0 ${Math.round(size * 0.3)}px ${tier.glow}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.round(size * 0.28),
      fontWeight: 800,
      color: tier.color,
    }}>
      {(player.ini || "??").toUpperCase().slice(0, 2)}
    </div>
  );
}
