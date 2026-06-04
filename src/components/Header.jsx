import { Zap, Users, Timer } from "lucide-react";
import { fmt, pad } from "../utils/formatters";

export default function Header({ players, timer }) {
  const { days, hrs, mins, ss } = timer;

  const stats = [
    { icon: <Users size={15} color="#1C75BC" />, label: "Active Geeks", val: players.length }
  ];

  return (
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

      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "rgba(44,24,24,0.65)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(250,164,26,0.18)", borderRadius: 10,
            padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
            flex: "0 1 auto",
          }}>
            {s.icon}
            <div>
              <div style={{ fontSize: 10, color: "#D8BD82", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 1 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F5E6D3" }}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}
