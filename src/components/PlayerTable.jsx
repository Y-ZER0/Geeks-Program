import { useState } from "react";
import { getTier } from "../utils/tiers";
import { fmt } from "../utils/formatters";
import Avatar from "./Avatar";
import TierBadge from "./TierBadge";
import SkeletonRow from "./SkeletonRow";
import ProgressBar from "./ProgressBar";
import HoverTooltip from "./HoverTooltip";

export default function PlayerTable({ players, startRank = 4, loading, animKey, total }) {
  const [hovered, setHovered] = useState(null);
  const [ttPos, setTtPos] = useState({ x: 0, y: 0 });

  return (
    <>
      <div style={{
        background: "rgba(44,24,24,0.5)", backdropFilter: "blur(14px)",
        border: "1px solid rgba(250,164,26,0.18)", borderRadius: 12, overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "56px 1fr 120px 1fr 130px",
          padding: "11px 20px",
          background: "rgba(250,164,26,0.1)",
          borderBottom: "1px solid rgba(250,164,26,0.18)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#D8BD82",
        }}>
          <span>Rank</span>
          <span>Player</span>
          <span style={{ textAlign: "center" }}>Points</span>
          <span style={{ textAlign: "center" }}>Progress</span>
          <span style={{ textAlign: "center" }}>Tier</span>
        </div>

        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} delay={i * 0.1} />)
          : players.map((player, i) => {
              const rank = startRank + i;
              const tier = getTier(player.sc);
              const isHov = hovered?.id === player.id;
              return (
                <div
                  key={player.id}
                  className="player-row"
                  onMouseMove={(e) => { setTtPos({ x: e.clientX, y: e.clientY }); setHovered(player); }}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "grid", gridTemplateColumns: "56px 1fr 120px 1fr 130px",
                    padding: "13px 20px",
                    borderBottom: "1px solid rgba(250,164,26,0.07)",
                    background: isHov ? tier.bg : i % 2 === 0 ? "rgba(44,24,24,0.18)" : "transparent",
                    boxShadow: isHov ? `inset 0 0 0 1px ${tier.color}55` : "none",
                    animation: `rowIn 0.3s ease ${i * 0.03}s both`,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#D8BD82", display: "flex", alignItems: "center" }}>{rank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar player={player} size={36} pts={player.sc} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{player.name}</span>
                  </div>
                  <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: "#FAA41A", display: "flex", alignItems: "center", justifyContent: "center" }}>{fmt(player.sc)}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ProgressBar pts={player.sc} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><TierBadge pts={player.sc} /></div>
                </div>
              );
            })
        }

        {!loading && players.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#9a8070", fontSize: 13 }}>
            No players found.
          </div>
        )}

        {!loading && total > 20 && (
          <div style={{ padding: "10px 20px", textAlign: "center", fontSize: 11, color: "#6a5a50", borderTop: "1px solid rgba(250,164,26,0.07)" }}>
            Showing {startRank}–{Math.min(startRank + players.length - 1, total + 3)} of {total + 3} players
          </div>
        )}
      </div>

      {hovered && !loading && <HoverTooltip player={hovered} pts={hovered.sc} pos={ttPos} />}
    </>
  );
}
