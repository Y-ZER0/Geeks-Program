import { useState, useEffect, useMemo, useCallback } from "react";
import { Crown, Shield, Code, Brain, Timer, Users, CheckSquare, Zap, Star, RefreshCw, AlertTriangle, Wifi } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   SANITY CONFIG  ← fill these in before deploying
   ═══════════════════════════════════════════════════════════════════
   1. Project ID  → sanity.io/manage → your project → Settings
   2. Dataset     → usually "production"
   3. CORS        → Settings → API → CORS Origins → add your domain
   ═══════════════════════════════════════════════════════════════════ */
const SANITY_PROJECT_ID = "xxxxxxxxxxxx";   // ← replace
const SANITY_DATASET    = "production";
const SANITY_API_VER    = "2024-01-01";

const GROQ = encodeURIComponent(`
  *[_type == "player"] | order(lower(displayName) asc) {
    "id":  _id,
    "name": name.current,
    "ini": initials,
    "col": avatarColor,
    "pts": {
      "live": {
        "AI": coalesce(live.ai,    0),
        "Cy": coalesce(live.cyber, 0),
        "Wb": coalesce(live.web,   0)
      },
      "w2": {
        "AI": coalesce(twoWeeks.ai,    0),
        "Cy": coalesce(twoWeeks.cyber, 0),
        "Wb": coalesce(twoWeeks.web,   0)
      },
      "mo": {
        "AI": coalesce(monthly.ai,    0),
        "Cy": coalesce(monthly.cyber, 0),
        "Wb": coalesce(monthly.web,   0)
      }
    }
  }
`);

/* ═══════════════ DATA HOOK ═══════════════ */
function usePlayers(autoRefreshMs) {
  const [players,   setPlayers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}?query=${GROQ}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sanity API responded with ${res.status} ${res.statusText}`);
      const { result } = await res.json();
      setPlayers(result ?? []);
      setFetchedAt(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(false); }, [load]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const t = setInterval(() => load(true), autoRefreshMs);
    return () => clearInterval(t);
  }, [load, autoRefreshMs]);

  return { players, loading, error, refreshing, fetchedAt, refetch: () => load(true) };
}

/* ═══════════════ HELPERS ═══════════════ */
const score = (p, tf, cat) => {
  const d = p.pts[tf];
  return cat === "All" ? d.AI + d.Cy + d.Wb : d[cat];
};

const TIERS = [
  { min:900, name:"Geeks Master", color:"#FFD883", glow:"rgba(255,216,131,0.55)", bg:"rgba(255,216,131,0.12)" },
  { min:600, name:"Geek",         color:"#C084FC", glow:"rgba(192,132,252,0.55)", bg:"rgba(192,132,252,0.12)" },
  { min:300, name:"Platinum",     color:"#A5F3FC", glow:"rgba(165,243,252,0.45)", bg:"rgba(165,243,252,0.10)" },
  { min:150, name:"Gold",         color:"#FFD700", glow:"rgba(255,215,0,0.50)",   bg:"rgba(255,215,0,0.10)"   },
  { min:75,  name:"Silver",       color:"#D1D5DB", glow:"rgba(209,213,219,0.40)", bg:"rgba(209,213,219,0.10)" },
  { min:0,   name:"Bronze",       color:"#CD7F32", glow:"rgba(205,127,50,0.45)",  bg:"rgba(205,127,50,0.10)"  },
];

const getTier     = (pts) => TIERS.find(t => pts >= t.min) || TIERS[5];
const fmt         = (n)   => n.toLocaleString();
const pad         = (n)   => String(n).padStart(2, "0");
const isSetup     = ()    => SANITY_PROJECT_ID !== "xxxxxxxxxxxx";

const getProgress = (pts) => {
  const steps = [75, 150, 300, 600, 900];
  const names  = ["Silver", "Gold", "Platinum", "Geek", "Geeks Master"];
  for (let i = 0; i < steps.length; i++) {
    if (pts < steps[i]) {
      const prev = i === 0 ? 0 : steps[i - 1];
      return { next: names[i], pct: Math.round(((pts - prev) / (steps[i] - prev)) * 100), rem: steps[i] - pts };
    }
  }
  return { next: "MAX", pct: 100, rem: 0 };
};

/* ═══════════════ SMALL COMPONENTS ═══════════════ */
function Avatar({ player, size = 40, pts }) {
  const tier = getTier(pts);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg,${player.col}22,${player.col}55)`,
      border: `2px solid ${pts >= 900 ? "#FAA41A" : player.col}99`,
      boxShadow: `0 0 ${Math.round(size * 0.3)}px ${tier.glow}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.28), fontWeight: 800, color: player.col,
    }}>
      {(player.ini || "??").toUpperCase().slice(0, 2)}
    </div>
  );
}

function TierBadge({ pts }) {
  const t = getTier(pts);
  return (
    <span style={{
      display: "inline-block", whiteSpace: "nowrap",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
      padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase",
      color: t.color, background: t.bg, border: `1px solid ${t.color}66`,
    }}>
      {t.name}
    </span>
  );
}

function HoverTooltip({ player, pts, pos }) {
  const tier = getTier(pts);
  const prog = getProgress(pts);
  const [pct, setPct] = useState(0);
  useEffect(() => { const t = setTimeout(() => setPct(prog.pct), 60); return () => clearTimeout(t); }, [pts]);

  const left = Math.min(pos.x + 16, window.innerWidth - 244);
  const top  = Math.max(pos.y - 130, 8);

  return (
    <div style={{
      position: "fixed", left, top, zIndex: 9999, width: 224, pointerEvents: "none",
      background: "rgba(14,6,6,0.97)", backdropFilter: "blur(20px)",
      border: `1px solid ${tier.color}44`, borderRadius: 10, padding: "14px 16px",
      boxShadow: `0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px ${tier.color}22`,
      animation: "ttFadeIn 0.15s ease both", fontFamily: "'Montserrat',sans-serif",
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
              height: "100%", borderRadius: 3,
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

function SkeletonRow({ delay = 0 }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "56px 1fr 100px 120px 130px",
      padding: "13px 20px", borderBottom: "1px solid rgba(250,164,26,0.07)",
      animation: `skPulse 1.4s ease-in-out ${delay}s infinite`,
      gap: 8, alignItems: "center",
    }}>
      {[40, 200, 60, 80, 90].map((w, i) => (
        <div key={i} style={{
          height: 14, borderRadius: 4, background: "rgba(250,164,26,0.1)",
          width: w, margin: i === 0 ? 0 : "0 auto",
        }} />
      ))}
    </div>
  );
}

/* ═══════════════ SETUP PLACEHOLDER ═══════════════ */
function SetupGuide() {
  return (
    <div style={{
      maxWidth: 560, margin: "80px auto", padding: "0 20px",
      fontFamily: "'Montserrat',sans-serif", textAlign: "center",
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔧</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#FAA41A", marginBottom: 8, letterSpacing: "0.04em" }}>
        Connect Sanity
      </h2>
      <p style={{ color: "#D8BD82", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
        Open <code style={{ background: "rgba(250,164,26,0.15)", padding: "2px 6px", borderRadius: 4, color: "#FAA41A" }}>
          geeks-leaderboard.jsx
        </code> and replace the three constants at the top:
      </p>
      <div style={{
        background: "rgba(44,24,24,0.7)", border: "1px solid rgba(250,164,26,0.3)",
        borderRadius: 10, padding: "16px 20px", textAlign: "left",
        fontSize: 12, color: "#D8BD82", lineHeight: 2, fontFamily: "monospace",
      }}>
        <span style={{ color: "#9a8070" }}>// geeks-leaderboard.jsx — line ~11</span><br />
        <span style={{ color: "#A5F3FC" }}>const</span> SANITY_PROJECT_ID = <span style={{ color: "#FAA41A" }}>"<strong>your_project_id</strong>"</span>;<br />
        <span style={{ color: "#A5F3FC" }}>const</span> SANITY_DATASET &nbsp;&nbsp;&nbsp;= <span style={{ color: "#FAA41A" }}>"production"</span>;<br />
        <span style={{ color: "#A5F3FC" }}>const</span> SANITY_API_VER &nbsp;&nbsp;= <span style={{ color: "#FAA41A" }}>"2024-01-01"</span>;
      </div>
      <div style={{ marginTop: 24, fontSize: 12, color: "#9a8070", lineHeight: 1.8 }}>
        Find your Project ID at <strong style={{ color: "#1C75BC" }}>sanity.io/manage</strong><br />
        Then allow your domain under <strong style={{ color: "#1C75BC" }}>Settings → API → CORS Origins</strong>
      </div>
    </div>
  );
}

/* ═══════════════ TIMEFRAMES & CATEGORIES ═══════════════ */
const TIMEFRAMES = [
  { key: "live", label: "Live Score"  },
  { key: "w2",   label: "2 Weeks"     },
  { key: "mo",   label: "Monthly"     },
];
const CATS = [
  { key: "All", label: "Overall",       Icon: Star   },
  { key: "AI",  label: "AI",            Icon: Brain  },
  { key: "Cy",  label: "Cybersecurity", Icon: Shield },
  { key: "Wb",  label: "Web Dev",       Icon: Code   },
];
const PODIUM_H  = [180, 240, 140];
const PODIUM_RK = [2, 1, 3];
const RANK_COL  = ["#C0C0C0", "#FAA41A", "#CD7F32"];
const ANIM_CLS  = ["podium-col-l", "podium-col-c", "podium-col-r"];

/* ═══════════════ MAIN ═══════════════ */
export default function GeeksLeaderboard() {
  const [tf,      setTf]      = useState("live");
  const [cat,     setCat]     = useState("All");
  const [hovered, setHovered] = useState(null);
  const [ttPos,   setTtPos]   = useState({ x: 0, y: 0 });
  const [animKey, setAnimKey] = useState(0);
  const [secs,    setSecs]    = useState(14 * 86400 + 7 * 3600 + 23 * 60);

  /* Auto-refresh every 60 s when on "live" tab */
  const { players, loading, error, refreshing, fetchedAt, refetch } =
    usePlayers(tf === "live" ? 60_000 : null);

  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() =>
    [...players].map(p => ({ ...p, sc: score(p, tf, cat) }))
      .sort((a, b) => b.sc - a.sc),
    [players, tf, cat]
  );

  const top3       = sorted.slice(0, 3);
  const rest       = sorted.slice(3);
  const totalTasks = sorted.reduce((a, p) => a + Math.floor(p.sc / 15), 0);
  const podium     = [top3[1], top3[0], top3[2]];

  const switchTf  = (v) => { setTf(v);  setAnimKey(k => k + 1); };
  const switchCat = (v) => { setCat(v); setAnimKey(k => k + 1); };

  const days = Math.floor(secs / 86400);
  const hrs  = Math.floor((secs % 86400) / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const ss   = secs % 60;

  /* ── guard: not configured ── */
  if (!isSetup()) return (
    <div style={{ background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)", minHeight: "100vh" }}>
      <SetupGuide />
    </div>
  );

  return (
    <div style={{
      fontFamily: "'Montserrat',sans-serif",
      background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
      minHeight: "100vh", color: "#F5E6D3", overflowX: "hidden",
    }}>

      {/* ── CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
         *{margin:0;padding:0;box-sizing:border-box}
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
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle at 15% 15%,rgba(250,164,26,0.07) 0%,transparent 55%),radial-gradient(circle at 85% 85%,rgba(28,117,188,0.06) 0%,transparent 55%)",
      }} />

      <div style={{ margin: "0 auto", padding: "36px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* ══ HEADER ══ */}
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,transparent,#FAA41A88)" }} />
            <Zap size={18} color="#FAA41A" />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(to left,transparent,#FAA41A88)" }} />
          </div>
          <h1 className="shimmer-title" style={{
            fontSize: "clamp(17px,4.2vw,36px)", fontWeight: 900,
            letterSpacing: "0.13em", textTransform: "uppercase", margin: "4px 0",
          }}>
            GEEKS PROGRAM LEADERBOARD
          </h1>
          <p style={{ fontSize: 12, letterSpacing: "0.06em", color: "#D8BD82", opacity: 0.75, margin: "4px 0 10px" }}>
            Tracking top performers pushing the boundaries of technology
          </p>
          <div style={{ height: 1, background: "linear-gradient(to right,transparent,#FAA41A88,transparent)" }} />
        </header>

        {/* ══ STATS ROW ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { icon: <CheckSquare size={15} color="#FAA41A" />, label: "Tasks Done",   val: fmt(totalTasks)                                 },
            { icon: <Users       size={15} color="#1C75BC" />, label: "Active Geeks", val: players.length                                  },
            { icon: <Timer       size={15} color="#D8BD82" />, label: "Season Ends",  val: `${days}d ${pad(hrs)}h ${pad(mins)}m ${pad(ss)}s` },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(44,24,24,0.65)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(250,164,26,0.18)", borderRadius: 10,
              padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
            }}>
              {s.icon}
              <div>
                <div style={{ fontSize: 10, color: "#D8BD82", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 1 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F5E6D3" }}>{s.val}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══ ERROR BANNER ══ */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.4)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            fontSize: 12, color: "#F5E6D3",
          }}>
            <AlertTriangle size={15} color="#E74C3C" />
            <span>{error}</span>
            <button onClick={refetch} className="ctrl-btn" style={{
              marginLeft: "auto", fontSize: 11, padding: "4px 10px", borderRadius: 6,
              background: "rgba(231,76,60,0.2)", color: "#F5E6D3", border: "1px solid rgba(231,76,60,0.5)",
            }}>
              Retry
            </button>
          </div>
        )}

        {/* ══ TIMEFRAME TABS ══ */}
        <div style={{
          background: "rgba(44,24,24,0.5)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(250,164,26,0.18)", borderRadius: 10,
          padding: 4, display: "flex", gap: 4, marginBottom: 10,
        }}>
          {TIMEFRAMES.map(t => {
            const a = tf === t.key;
            return (
              <button key={t.key} className="ctrl-btn" onClick={() => switchTf(t.key)} style={{
                flex: 1, padding: "9px 12px", borderRadius: 7,
                fontWeight: a ? 700 : 500, fontSize: 12, letterSpacing: "0.05em",
                background: a ? "linear-gradient(135deg,#FAA41A,#FFD883)" : "transparent",
                color: a ? "#2C1818" : "#D8BD82",
                boxShadow: a ? "0 3px 14px rgba(250,164,26,0.4)" : "none",
                textTransform: "uppercase",
              }}>
                {t.label}
                {t.key === "live" && (
                  <span style={{
                    marginLeft: 6, display: "inline-block",
                    width: 6, height: 6, borderRadius: "50%",
                    background: a ? "#2C1818" : "#FAA41A",
                    verticalAlign: "middle",
                    animation: "skPulse 1.4s ease-in-out infinite",
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ══ CATEGORY CHIPS + REFRESH ══ */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          {CATS.map(c => {
            const a = cat === c.key;
            return (
              <button key={c.key} className="ctrl-btn" onClick={() => switchCat(c.key)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, fontSize: 12,
                fontWeight: a ? 700 : 500, letterSpacing: "0.05em", textTransform: "uppercase",
                background: a ? "rgba(250,164,26,0.14)" : "rgba(44,24,24,0.45)",
                border: `1px solid ${a ? "#FAA41A" : "rgba(216,189,130,0.25)"}`,
                color: a ? "#FAA41A" : "#D8BD82",
                boxShadow: a ? "0 0 14px rgba(250,164,26,0.3)" : "none",
              }}>
                <c.Icon size={13} />{c.label}
              </button>
            );
          })}

          {/* Refresh control */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {fetchedAt && (
              <span style={{ fontSize: 10, color: "#9a8070", display: "flex", alignItems: "center", gap: 4 }}>
                <Wifi size={11} color="#9a8070" />
                {fetchedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <button onClick={refetch} className="ctrl-btn" title="Refresh data" style={{
              display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8,
              background: "rgba(44,24,24,0.45)", border: "1px solid rgba(216,189,130,0.25)",
              color: "#D8BD82", fontSize: 11,
            }}>
              <RefreshCw size={12} className={refreshing ? "spin" : ""} />
              {refreshing ? "Syncing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* ══ PODIUM ══ */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginBottom: 44 }}>
            {PODIUM_H.map((h, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                flex: i === 1 ? "0 0 200px" : "0 0 160px",
              }}>
                <div style={{ width: i===1?72:56, height: i===1?72:56, borderRadius: "50%", background: "rgba(250,164,26,0.08)", marginBottom: 10, animation: `skPulse 1.4s ease-in-out ${i*0.2}s infinite` }} />
                <div style={{ height: 14, width: 80, background: "rgba(250,164,26,0.08)", borderRadius: 4, marginBottom: 8, animation: `skPulse 1.4s ease-in-out ${i*0.2}s infinite` }} />
                <div style={{ width: "100%", height: `${h}px`, background: "rgba(250,164,26,0.06)", borderRadius: "8px 8px 0 0", animation: `skPulse 1.4s ease-in-out ${i*0.2}s infinite` }} />
              </div>
            ))}
          </div>
        ) : (
          <div key={`podium-${animKey}`} style={{
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            gap: 10, marginBottom: 44, padding: "16px 0 0",
          }}>
            {podium.map((player, i) => {
              if (!player) return null;
              const rk   = PODIUM_RK[i];
              const h    = PODIUM_H[i];
              const isC  = rk === 1;
              const tier = getTier(player.sc);
              const rc   = RANK_COL[rk - 1];
              return (
                <div key={player.id} className={ANIM_CLS[i]} style={{
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
        )}

        {/* ══ TABLE ══ */}
        <div style={{
          background: "rgba(44,24,24,0.5)", backdropFilter: "blur(14px)",
          border: "1px solid rgba(250,164,26,0.18)", borderRadius: 12, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "56px 1fr 100px 120px 130px",
            padding: "11px 20px",
            background: "rgba(250,164,26,0.1)",
            borderBottom: "1px solid rgba(250,164,26,0.18)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#D8BD82",
          }}>
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
                const tier  = getTier(player.sc);
                const tasks = Math.floor(player.sc / 15);
                const isHov = hovered?.id === player.id;
                return (
                  <div
                    key={`${player.id}-${animKey}`}
                    className="player-row"
                    onMouseMove={(e) => { setTtPos({ x: e.clientX, y: e.clientY }); setHovered(player); }}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: "grid", gridTemplateColumns: "56px 1fr 100px 120px 130px",
                      padding: "13px 20px",
                      borderBottom: "1px solid rgba(250,164,26,0.07)",
                      background: isHov ? tier.bg : i % 2 === 0 ? "rgba(44,24,24,0.18)" : "transparent",
                      boxShadow: isHov ? `inset 0 0 0 1px ${tier.color}55` : "none",
                      animation: `rowIn 0.3s ease ${i * 0.03}s both`,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#D8BD82", display: "flex", alignItems: "center" }}>{i + 4}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar player={player} size={36} pts={player.sc} />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{player.name}</span>
                    </div>
                    <div style={{ textAlign: "center", fontWeight: 600, fontSize: 13, color: "#D8BD82", display: "flex", alignItems: "center", justifyContent: "center" }}>{tasks}</div>
                    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: "#FAA41A", display: "flex", alignItems: "center", justifyContent: "center" }}>{fmt(player.sc)}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><TierBadge pts={player.sc} /></div>
                  </div>
                );
              })
          }

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
