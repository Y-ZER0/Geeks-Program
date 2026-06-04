import { useState, useCallback, useMemo } from "react";
import { usePlayers } from "./hooks/usePlayers";
import { useTimer } from "./hooks/useTimer";
import { score } from "./utils/scoring";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import Podium from "./components/Podium";
import PlayerTable from "./components/PlayerTable";
import ErrorBanner from "./components/ErrorBanner";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API_BASE = "/api";
const PAGE_SIZE = 20;

export default function GeeksLeaderboard({ players: staticPlayers, fetchUrl, autoRefreshMs } = {}) {
  const [tf, setTf] = useState("live");
  const [cat, setCat] = useState("All");
  const [animKey, setAnimKey] = useState(0);
  const [page, setPage] = useState(1);

  const { players, loading, error, refreshing, fetchedAt, refetch } = usePlayers({
    players: staticPlayers,
    fetchUrl: fetchUrl || `${API_BASE}/leaderboard?timeframe=${tf}&category=${cat}`,
    autoRefreshMs: tf === "live" ? (autoRefreshMs ?? 60_000) : null,
    tf,
    cat,
  });

  const sorted = useMemo(() =>
    [...players].map((p) => ({ ...p, sc: score(p, tf, cat) }))
      .sort((a, b) => b.sc - a.sc)
      .filter((p) => cat === "All" || p.sc > 0),
    [players, tf, cat]
  );

  const totalPages = Math.max(1, Math.ceil((sorted.length - 3) / PAGE_SIZE));
  const pageStart = 3 + (page - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pagePlayers = sorted.slice(pageStart, pageEnd);

  const timer = useTimer();

  const switchTf = useCallback((v) => { setTf(v); setAnimKey((k) => k + 1); setPage(1); }, []);
  const switchCat = useCallback((v) => { setCat(v); setAnimKey((k) => k + 1); setPage(1); }, []);

  const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);
  const onRefetch = useCallback(() => { setPage(1); refetch(); }, [refetch]);

  return (
    <div style={{
      fontFamily: "'Montserrat',sans-serif",
      background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
      minHeight: "100vh", color: "#F5E6D3", overflowX: "hidden",
    }}>
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
        .spin{animation:spinCw .8s linear infinite}
        .page-btn{background:rgba(250,164,26,0.08);border:1px solid rgba(250,164,26,0.2);border-radius:8px;color:#D8BD82;cursor:pointer;padding:8px 16px;font-size:12;font-family:inherit;font-weight:600;transition:all 0.2s;display:flex;align-items:center;gap:6px}
        .page-btn:hover{background:rgba(250,164,26,0.18);border-color:rgba(250,164,26,0.4);color:#FAA41A}
        .page-btn:disabled{opacity:0.3;cursor:not-allowed}
      `}</style>

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle at 15% 15%,rgba(250,164,26,0.07) 0%,transparent 55%),radial-gradient(circle at 85% 85%,rgba(28,117,188,0.06) 0%,transparent 55%)",
      }} />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 20px 60px", position: "relative", zIndex: 1 }}>
        <Header players={players} timeframe={tf} category={cat} timer={timer} />
        <ErrorBanner message={error} onRetry={onRefetch} />
        <FilterBar
          timeframe={tf} onTimeframeChange={switchTf}
          category={cat} onCategoryChange={switchCat}
          onRefresh={refetch} refreshing={refreshing} fetchedAt={fetchedAt}
        />
        <Podium players={sorted} timeframe={tf} category={cat} loading={loading} animKey={animKey} />

        {sorted.length > 3 && (
          <PlayerTable
            players={pagePlayers}
            startRank={pageStart + 1}
            loading={loading}
            animKey={animKey}
            total={sorted.length - 3}
          />
        )}

        {sorted.length > 3 && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <button className="page-btn" onClick={goPrev} disabled={page <= 1}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontSize: 12, color: "#9a8070" }}>
              Page {page} of {totalPages}
            </span>
            <button className="page-btn" onClick={goNext} disabled={page >= totalPages}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <div style={{ height: 1, background: "linear-gradient(to right,transparent,#FAA41A66,transparent)", marginBottom: 12 }} />
          <p style={{ fontSize: 11, color: "#9a8070", letterSpacing: "0.05em" }}>
            IEEE Computer Society · University of Jordan
          </p>
        </div>
      </div>
    </div>
  );
}
