import { useMemo } from "react";
import { Crown } from "lucide-react";
import { score } from "../utils/scoring";
import { getTier } from "../utils/tiers";
import { fmt } from "../utils/formatters";
import { PODIUM_HEIGHTS, PODIUM_RANKS, RANK_COLORS, ANIM_CLASSES } from "../constants";
import Avatar from "./Avatar";
import TierBadge from "./TierBadge";

export default function Podium({ players, timeframe, category, loading, animKey }) {
  const sorted = useMemo(() =>
    [...players].map((p) => ({ ...p, sc: score(p, timeframe, category) }))
      .sort((a, b) => b.sc - a.sc),
    [players, timeframe, category]
  );

  const top3 = sorted.slice(0, 3);
  const podium = [top3[1], top3[0], top3[2]];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginBottom: 44 }}>
        {PODIUM_HEIGHTS.map((h, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            flex: i === 1 ? "0 0 200px" : "0 0 160px",
          }}>
            <div style={{ width: i === 1 ? 72 : 56, height: i === 1 ? 72 : 56, borderRadius: "50%", background: "rgba(250,164,26,0.08)", marginBottom: 10, animation: `skPulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            <div style={{ height: 14, width: 80, background: "rgba(250,164,26,0.08)", borderRadius: 4, marginBottom: 8, animation: `skPulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
            <div style={{ width: "100%", height: `${h}px`, background: "rgba(250,164,26,0.06)", borderRadius: "8px 8px 0 0", animation: `skPulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div key={`podium-${animKey}`} style={{
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      gap: 10, marginBottom: 44, padding: "16px 0 0",
    }}>
      {podium.map((player, i) => {
        if (!player) return null;
        const rk = PODIUM_RANKS[i];
        const h = PODIUM_HEIGHTS[i];
        const isC = rk === 1;
        const tier = getTier(player.sc);
        const rc = RANK_COLORS[rk - 1];
        return (
          <div key={player.id} className={ANIM_CLASSES[i]} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            flex: isC ? "0 0 200px" : "0 0 160px",
          }}>
            {isC && <div className="crown-bob" style={{ marginBottom: 6 }}><Crown size={28} color="#FAA41A" fill="#FAA41A" /></div>}
            <Avatar player={player} size={isC ? 72 : 56} pts={player.sc} />
            <div style={{ height: 8 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: rc, letterSpacing: "0.1em", marginBottom: 3 }}>#{rk}</div>
            <div style={{ fontSize: isC ? 14 : 12, fontWeight: 700, color: "#F5E6D3", marginBottom: 4, textAlign: "center" }}>
              {player.name}
            </div>
            <div style={{ fontSize: isC ? 20 : 15, fontWeight: 800, color: isC ? "#FAA41A" : "#D8BD82", marginBottom: 12 }}>
              {fmt(player.sc)} <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 500 }}>pts</span>
            </div>
            <div className={isC ? "aura-first" : ""} style={{
              width: "100%", height: `${h}px`,
              background: isC
                ? "linear-gradient(180deg,rgba(250,164,26,0.22) 0%,rgba(250,164,26,0.05) 100%)"
                : rk === 2
                  ? "linear-gradient(180deg,rgba(192,192,192,0.18) 0%,rgba(192,192,192,0.04) 100%)"
                  : "linear-gradient(180deg,rgba(205,127,50,0.18) 0%,rgba(205,127,50,0.04) 100%)",
              border: `1px solid ${isC ? "rgba(250,164,26,0.45)" : rk === 2 ? "rgba(192,192,192,0.3)" : "rgba(205,127,50,0.3)"}`,
              borderBottom: "none", borderRadius: "8px 8px 0 0",
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", overflow: "hidden",
            }}>
              <TierBadge pts={player.sc} />
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(250,164,26,0.03) 18px,rgba(250,164,26,0.03) 19px)" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
