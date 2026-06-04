import { RefreshCw, Wifi } from "lucide-react";
import { TIMEFRAMES, CATS } from "../constants";

export default function FilterBar({
  timeframe, onTimeframeChange,
  category, onCategoryChange,
  onRefresh, refreshing, fetchedAt,
}) {
  return (
    <>
      <div style={{
        background: "rgba(44,24,24,0.5)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(250,164,26,0.18)", borderRadius: 10,
        padding: 4, display: "flex", gap: 4, marginBottom: 10,
      }}>
        {TIMEFRAMES.map((t) => {
          const active = timeframe === t.key;
          return (
            <button key={t.key} onClick={() => onTimeframeChange(t.key)} style={{
              flex: 1, padding: "9px 12px", borderRadius: 7, border: "none",
              fontWeight: active ? 700 : 500, fontSize: 12, letterSpacing: "0.05em",
              background: active ? "linear-gradient(135deg,#FAA41A,#FFD883)" : "transparent",
              color: active ? "#2C1818" : "#D8BD82",
              boxShadow: active ? "0 3px 14px rgba(250,164,26,0.4)" : "none",
              textTransform: "uppercase", cursor: "pointer", fontFamily: "'Montserrat',sans-serif",
              transition: "all 0.2s ease",
            }}>
              {t.label}
              {t.key === "live" && (
                <span style={{
                  marginLeft: 6, display: "inline-block",
                  width: 6, height: 6, borderRadius: "50%",
                  background: active ? "#2C1818" : "#FAA41A",
                  verticalAlign: "middle",
                  animation: "skPulse 1.4s ease-in-out infinite",
                }} />
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
        {CATS.map((c) => {
          const active = category === c.key;
          return (
            <button key={c.key} onClick={() => onCategoryChange(c.key)} style={{
              display: "flex", alignItems: "center", gap: 6, border: "none",
              padding: "7px 14px", borderRadius: 8, fontSize: 12, fontFamily: "'Montserrat',sans-serif",
              fontWeight: active ? 700 : 500, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
              background: active ? "rgba(250,164,26,0.14)" : "rgba(44,24,24,0.45)",
              border: `1px solid ${active ? "#FAA41A" : "rgba(216,189,130,0.25)"}`,
              color: active ? "#FAA41A" : "#D8BD82",
              boxShadow: active ? "0 0 14px rgba(250,164,26,0.3)" : "none",
              transition: "all 0.2s ease",
            }}>
              <c.Icon size={13} />{c.label}
            </button>
          );
        })}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {fetchedAt && (
            <span style={{ fontSize: 10, color: "#9a8070", display: "flex", alignItems: "center", gap: 4 }}>
              <Wifi size={11} color="#9a8070" />
              {fetchedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button onClick={onRefresh} title="Refresh data" style={{
            display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 8,
            background: "rgba(44,24,24,0.45)", border: "1px solid rgba(216,189,130,0.25)", cursor: "pointer",
            color: "#D8BD82", fontSize: 11, fontFamily: "'Montserrat',sans-serif",
            transition: "all 0.2s ease",
          }}>
            <RefreshCw size={12} className={refreshing ? "spin" : ""} />
            {refreshing ? "Syncing…" : "Refresh"}
          </button>
        </div>
      </div>
    </>
  );
}
