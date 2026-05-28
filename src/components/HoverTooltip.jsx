/**
 * HoverTooltip Component
 * Shows player progress toward next tier on hover
 */

import { useState, useEffect } from "react";
import { getTier, getProgress } from "../utils/tiers";
import { fmt } from "../utils/format";
import { TierBadge } from "./TierBadge";

export function HoverTooltip({ player, pts, pos }) {
  const tier = getTier(pts);
  const prog = getProgress(pts);
  const [pct, setPct] = useState(0);
  
  useEffect(() => {
    const t = setTimeout(() => setPct(prog.pct), 60);
    return () => clearTimeout(t);
  }, [pts]);

  const left = Math.min(pos.x + 16, window.innerWidth - 244);
  const top = Math.max(pos.y - 130, 8);

  return (
    <div style={{
      position: "fixed",
      left,
      top,
      zIndex: 9999,
      width: 224,
      pointerEvents: "none",
      background: "rgba(14,6,6,0.97)",
      backdropFilter: "blur(20px)",
      border: `1px solid ${tier.color}44`,
      borderRadius: 10,
      padding: "14px 16px",
      boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${tier.color}22`,
      animation: "ttFadeIn 0.15s ease both",
      fontFamily: "'Montserrat',sans-serif",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#F5E6D3" }}>{player.name}</span>
        <TierBadge pts={pts} />
      </div>
      <div style={{ fontSize: 11, color: "#D8BD82", marginBottom: 6 }}>
        Points: <span style={{ color: "#FAA41A", fontWeight: 700 }}>{fmt(pts)}</span>
      </div>
      {prog.next !== "MAX" ? (
        <>
          <div style={{ fontSize: 11, color: "#D8BD82", marginBottom: 6 }}>
            {prog.rem} pts → <span style={{ color: getTier(pts + prog.rem + 1).color }}>{prog.next}</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
            <div style={{
              height: "100%",
              borderRadius: 3,
              width: `${pct}%`,
              background: `linear-gradient(90deg,${tier.color},${getTier(pts + prog.rem + 1).color})`,
              transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9a8070" }}>
            <span>{tier.name}</span><span>{pct}%</span><span>{prog.next}</span>
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, color: "#FFD883", fontWeight: 600 }}>✦ Maximum Rank Achieved</div>
      )}
    </div>
  );
}
