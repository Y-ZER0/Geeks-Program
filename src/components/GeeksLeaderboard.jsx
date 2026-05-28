/**
 * GeeksLeaderboard Component
 * Main leaderboard display with real-time scoring
 */

import { useState, useEffect, useMemo } from "react";
import {
  Crown,
  Shield,
  Code,
  Brain,
  Users,
  CheckSquare,
  Zap,
  Star,
  RefreshCw,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import { usePlayers } from "../hooks/usePlayers";
import { score, TIMEFRAMES, CATEGORIES } from "../utils/scoring";
import { getTier } from "../utils/tiers";
import { fmt, formatTime } from "../utils/format";
import { isConfigured } from "../config/sanity";
import { Avatar } from "./Avatar";
import { TierBadge } from "./TierBadge";
import { HoverTooltip } from "./HoverTooltip";
import { SkeletonRow } from "./SkeletonRow";
import { SetupGuide } from "./SetupGuide";

const PODIUM_H = [180, 240, 140];
const PODIUM_RK = [2, 1, 3];
const RANK_COL = ["#C0C0C0", "#FAA41A", "#CD7F32"];
const ANIM_CLS = ["podium-col-l", "podium-col-c", "podium-col-r"];

export default function GeeksLeaderboard() {
  const [tf, setTf] = useState("live");
  const [cat, setCat] = useState("All");
  const [hovered, setHovered] = useState(null);
  const [ttPos, setTtPos] = useState({ x: 0, y: 0 });
  const [animKey, setAnimKey] = useState(0);

  // Auto-refresh every 60s when on "live" tab
  const { players, loading, error, refreshing, fetchedAt, refetch } = usePlayers(
    tf === "live" ? 60_000 : null
  );

  // Sort and calculate leaderboard
  const sorted = useMemo(
    () =>
      [...players]
        .map((p) => ({ ...p, sc: score(p, tf, cat) }))
        .sort((a, b) => b.sc - a.sc),
    [players, tf, cat]
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const totalTasks = sorted.reduce((a, p) => a + (p.tasks || 0), 0);
  const podium = [top3[1], top3[0], top3[2]];

  const switchTf = (v) => {
    setTf(v);
    setAnimKey((k) => k + 1);
  };
  const switchCat = (v) => {
    setCat(v);
    setAnimKey((k) => k + 1);
  };

  // Guard: not configured
  if (!isConfigured())
    return (
      <div
        style={{
          background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
          minHeight: "100vh",
        }}
      >
        <SetupGuide />
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Montserrat',sans-serif",
        background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
        width: "100%",
        minHeight: "100vh",
        color: "#F5E6D3",
        overflowX: "hidden",
      }}
    >
      {/* ── CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#160C0C}
        ::-webkit-scrollbar-thumb{background:#FAA41A;border-radius:3px}
        @keyframes ttFadeIn{from{opacity:0;transform:scale(0.93) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideUp{from{transform:translateY(70px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes crownBob{0%,100%{transform:translateY(0) scale(1);filter:drop-shadow(0 0 6px #FAA41A)}50%{transform:translateY(-8px) scale(1.1);filter:drop-shadow(0 0 16px #FAA41A)}}
        @keyframes auraPulse{0%,100%{box-shadow:0 0 28px rgba(250,164,26,0.35)}50%{box-shadow:0 0 56px rgba(250,164,26,0.65)}}
        @keyframes shimmerText{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes rowIn{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:translateX(0)}}
        @keyframes skPulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes spinCw{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .podium-col-l{animation:slideUp .55s cubic-bezier(.34,1.56,.64,1) .08s both}
        .podium-col-c{animation:slideUp .55s cubic-bezier(.34,1.56,.64,1) 0s both}
        .podium-col-r{animation:slideUp .55s cubic-bezier(.34,1.56,.64,1) .16s both}
        .crown-bob{animation:crownBob 2.6s ease-in-out infinite;display:inline-block}
        .aura-first{animation:auraPulse 3s ease-in-out infinite}
        .shimmer-title{
          background:linear-gradient(90deg,#FAA41A,#FFD883,#FAA41A,#FFD883);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmerText 3s linear infinite}
        .player-row{transition:transform .18s ease,background .18s ease,box-shadow .18s ease;cursor:pointer}
        .player-row:hover{transform:scale(1.006) translateX(3px)}
        .ctrl-btn{transition:all .2s ease;cursor:pointer;border:none;font-family:'Montserrat',sans-serif}
        .ctrl-btn:hover{opacity:.85}
        .spin{animation:spinCw .8s linear infinite}
      `}</style>

      {/* ── BG radials ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "radial-gradient(circle at 15% 15%,rgba(250,164,26,0.07) 0%,transparent 55%),radial-gradient(circle at 85% 85%,rgba(28,117,188,0.06) 0%,transparent 55%)",
        }}
      />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px 60px", position: "relative", zIndex: 1 }}>
        {/* ══ HEADER ══ */}
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,#FAA41A88)" }} />
            <Zap size={18} color="#FAA41A" />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,#FAA41A88)" }} />
          </div>
          <h1
            className="shimmer-title"
            style={{
              fontSize: "clamp(17px,4.2vw,36px)",
              fontWeight: 900,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              margin: "4px 0",
            }}
          >
            GEEKS PROGRAM LEADERBOARD
          </h1>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "#D8BD82",
              opacity: 0.75,
              margin: "4px 0 10px",
            }}
          >
            Tracking top performers pushing the boundaries of technology
          </p>
          <div style={{ height: 1, background: "linear-gradient(to right,transparent,#FAA41A88,transparent)" }} />
        </header>

        {/* ══ STATS ROW ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <CheckSquare size={15} color="#FAA41A" />, label: "Tasks Done", val: fmt(totalTasks) },
            { icon: <Users size={15} color="#1C75BC" />, label: "Active Geeks", val: players.length },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(44,24,24,0.65)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(250,164,26,0.18)",
                borderRadius: 10,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {s.icon}
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#D8BD82",
                    textTransform: "uppercase",
                    letterSpacing: "0.09em",
                    marginBottom: 1,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F5E6D3" }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ ERROR BANNER ══ */}
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(231,76,60,0.12)",
              border: "1px solid rgba(231,76,60,0.4)",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 12,
              color: "#F5E6D3",
            }}
          >
            <AlertTriangle size={15} color="#E74C3C" />
            <span>{error}</span>
            <button
              onClick={refetch}
              className="ctrl-btn"
              style={{
                marginLeft: "auto",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 6,
                background: "rgba(231,76,60,0.2)",
                color: "#F5E6D3",
                border: "1px solid rgba(231,76,60,0.5)",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ══ TIMEFRAME TABS ══ */}
        <div
          style={{
            background: "rgba(44,24,24,0.5)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(250,164,26,0.18)",
            borderRadius: 10,
            padding: 4,
            display: "flex",
            gap: 4,
            marginBottom: 10,
          }}
        >
          {TIMEFRAMES.map((t) => {
            const a = tf === t.key;
            return (
              <button
                key={t.key}
                className="ctrl-btn"
                onClick={() => switchTf(t.key)}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: 7,
                  fontWeight: a ? 700 : 500,
                  fontSize: 12,
                  letterSpacing: "0.05em",
                  background: a ? "linear-gradient(135deg,#FAA41A,#FFD883)" : "transparent",
                  color: a ? "#2C1818" : "#D8BD82",
                  boxShadow: a ? "0 3px 14px rgba(250,164,26,0.4)" : "none",
                  textTransform: "uppercase",
                }}
              >
                {t.label}
                {t.key === "live" && (
                  <span
                    style={{
                      marginLeft: 6,
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: a ? "#2C1818" : "#FAA41A",
                      verticalAlign: "middle",
                      animation: "skPulse 1.4s ease-in-out infinite",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ══ CATEGORY CHIPS + REFRESH ══ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          {CATEGORIES.map((c) => {
            const a = cat === c.key;
            const IconComponent = c.icon === "Star" ? Star : c.icon === "Brain" ? Brain : c.icon === "Shield" ? Shield : Code;
            return (
              <button
                key={c.key}
                className="ctrl-btn"
                onClick={() => switchCat(c.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: a ? 700 : 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background: a ? "rgba(250,164,26,0.14)" : "rgba(44,24,24,0.45)",
                  border: `1px solid ${a ? "#FAA41A" : "rgba(216,189,130,0.25)"}`,
                  color: a ? "#FAA41A" : "#D8BD82",
                  boxShadow: a ? "0 0 14px rgba(250,164,26,0.3)" : "none",
                }}
              >
                <IconComponent size={13} />
                {c.label}
              </button>
            );
          })}

          {/* Refresh control */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {fetchedAt && (
              <span
                style={{
                  fontSize: 10,
                  color: "#9a8070",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Wifi size={11} color="#9a8070" />
                {formatTime(fetchedAt)}
              </span>
            )}
            <button
              onClick={refetch}
              className="ctrl-btn"
              title="Refresh data"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 12px",
                borderRadius: 8,
                background: "rgba(44,24,24,0.45)",
                border: "1px solid rgba(216,189,130,0.25)",
                color: "#D8BD82",
                fontSize: 11,
              }}
            >
              <RefreshCw size={12} className={refreshing ? "spin" : ""} />
              {refreshing ? "Syncing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* ══ PODIUM ══ */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginBottom: 44 }}>
            {PODIUM_H.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: i === 1 ? "0 0 200px" : "0 0 160px",
                }}
              >
                <div
                  style={{
                    width: i === 1 ? 72 : 56,
                    height: i === 1 ? 72 : 56,
                    borderRadius: "50%",
                    background: "rgba(250,164,26,0.08)",
                    marginBottom: 10,
                    animation: `skPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
                <div
                  style={{
                    height: 14,
                    width: 80,
                    background: "rgba(250,164,26,0.08)",
                    borderRadius: 4,
                    marginBottom: 8,
                    animation: `skPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: `${h}px`,
                    background: "rgba(250,164,26,0.06)",
                    borderRadius: "8px 8px 0 0",
                    animation: `skPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            key={`podium-${animKey}`}
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 10,
              marginBottom: 44,
              padding: "16px 0 0",
            }}
          >
            {podium.map((player, i) => {
              if (!player) return null;
              const rk = PODIUM_RK[i];
              const h = PODIUM_H[i];
              const isC = rk === 1;
              const tier = getTier(player.sc);
              const rc = RANK_COL[rk - 1];
              return (
                <div key={player.id} className={ANIM_CLS[i]} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: isC ? "0 0 200px" : "0 0 160px",
                }}>
                  {isC && (
                    <div className="crown-bob" style={{ marginBottom: 6 }}>
                      <Crown size={28} color="#FAA41A" fill="#FAA41A" />
                    </div>
                  )}
                  <Avatar player={player} size={isC ? 72 : 56} pts={player.sc} />
                  <div style={{ height: 8 }} />
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: rc,
                      letterSpacing: "0.1em",
                      marginBottom: 3,
                    }}
                  >
                    #{rk}
                  </div>
                  <div
                    style={{
                      fontSize: isC ? 14 : 12,
                      fontWeight: 700,
                      color: "#F5E6D3",
                      marginBottom: 4,
                      textAlign: "center",
                    }}
                  >
                    {player.name}
                  </div>
                  <div
                    style={{
                      fontSize: isC ? 20 : 15,
                      fontWeight: 800,
                      color: isC ? "#FAA41A" : "#D8BD82",
                      marginBottom: 12,
                    }}
                  >
                    {fmt(player.sc)} <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 500 }}>pts</span>
                  </div>
                  <div
                    className={isC ? "aura-first" : ""}
                    style={{
                      width: "100%",
                      height: `${h}px`,
                      background: isC
                        ? "linear-gradient(180deg,rgba(250,164,26,0.22) 0%,rgba(250,164,26,0.05) 100%)"
                        : rk === 2
                          ? "linear-gradient(180deg,rgba(192,192,192,0.18) 0%,rgba(192,192,192,0.04) 100%)"
                          : "linear-gradient(180deg,rgba(205,127,50,0.18) 0%,rgba(205,127,50,0.04) 100%)",
                      border: `1px solid ${
                        isC ? "rgba(250,164,26,0.45)" : rk === 2 ? "rgba(192,192,192,0.3)" : "rgba(205,127,50,0.3)"
                      }`,
                      borderBottom: "none",
                      borderRadius: "8px 8px 0 0",
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <TierBadge pts={player.sc} />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        backgroundImage:
                          "repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(250,164,26,0.03) 18px,rgba(250,164,26,0.03) 19px)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TABLE ══ */}
        <div
          style={{
            background: "rgba(44,24,24,0.5)",
            backdropFilter: "blur(14px)",
            border: "1px solid rgba(250,164,26,0.18)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr 100px 120px 130px",
              padding: "11px 20px",
              background: "rgba(250,164,26,0.1)",
              borderBottom: "1px solid rgba(250,164,26,0.18)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#D8BD82",
            }}
          >
            <span>Rank</span>
            <span>Player</span>
            <span style={{ textAlign: "center" }}>Tasks</span>
            <span style={{ textAlign: "center" }}>Points</span>
            <span style={{ textAlign: "center" }}>Tier</span>
          </div>

          {/* Skeleton rows while loading */}
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} delay={i * 0.1} />)
            : rest.map((player, i) => {
                const tier = getTier(player.sc);
                const isHov = hovered?.id === player.id;
                return (
                  <div
                    key={`${player.id}-${animKey}`}
                    className="player-row"
                    onMouseMove={(e) => {
                      setTtPos({ x: e.clientX, y: e.clientY });
                      setHovered(player);
                    }}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr 100px 120px 130px",
                      padding: "13px 20px",
                      borderBottom: "1px solid rgba(250,164,26,0.07)",
                      background: isHov ? tier.bg : i % 2 === 0 ? "rgba(44,24,24,0.18)" : "transparent",
                      boxShadow: isHov ? `inset 0 0 0 1px ${tier.color}55` : "none",
                      animation: `rowIn 0.3s ease ${i * 0.03}s both`,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#D8BD82",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {i + 4}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar player={player} size={36} pts={player.sc} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{player.name}</span>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#D8BD82",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {player.tasks}
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#FAA41A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {fmt(player.sc)}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TierBadge pts={player.sc} />
                    </div>
                  </div>
                );
              })}

          {/* Empty state */}
          {!loading && players.length === 0 && !error && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9a8070", fontSize: 13 }}>
              No players found. Add players in your Sanity Studio to get started.
            </div>
          )}
        </div>

        {/* ══ FOOTER ══ */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <div style={{ height: 1, background: "linear-gradient(to right,transparent,#FAA41A66,transparent)", marginBottom: 12 }} />
          <p style={{ fontSize: 11, color: "#9a8070", letterSpacing: "0.05em" }}>
            IEEE Computer Society · University of Jordan
          </p>
        </div>
      </div>

      {/* ══ TOOLTIP ══ */}
      {hovered && !loading && <HoverTooltip player={hovered} pts={hovered.sc} pos={ttPos} />}
    </div>
  );
}
