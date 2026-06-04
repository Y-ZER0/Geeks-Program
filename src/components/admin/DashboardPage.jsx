import { Helmet } from "react-helmet-async";
import { useState, useCallback } from "react";
import { useAuth, useApi } from "../../hooks/useAuth.jsx";
import PlayerGrid from "./PlayerGrid";
import AdjustPoints from "./AdjustPoints";
import AuditLog from "./AuditLog";
import { LogOut, Users, PlusCircle, History, Menu, X } from "lucide-react";

const TABS = [
  { key: "players", label: "Players", Icon: Users },
  { key: "adjust", label: "Adjust Points", Icon: PlusCircle },
  { key: "audit", label: "Audit Log", Icon: History },
];

export default function DashboardPage() {
  const { admin, logout } = useAuth();
  const { fetch } = useApi();
  const [tab, setTab] = useState("players");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = "/admin/login";
  }, [logout]);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — Geeks Program Leaderboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
        fontFamily: "'Montserrat',sans-serif", color: "#F5E6D3",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:5px}
          ::-webkit-scrollbar-track{background:#160C0C}
          ::-webkit-scrollbar-thumb{background:#FAA41A;border-radius:3px}
        `}</style>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1px solid rgba(250,164,26,0.15)",
          background: "rgba(44,24,24,0.5)", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              display: "none", background: "none", border: "none", color: "#D8BD82", cursor: "pointer",
              "@media (max-width: 768px)": { display: "block" },
            }}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.08em", color: "#FAA41A", margin: 0 }}>
              ADMIN<span style={{ color: "#D8BD82", fontWeight: 400 }}> · {admin?.username}</span>
            </h1>
          </div>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
            borderRadius: 8, border: "1px solid rgba(231,76,60,0.4)", cursor: "pointer",
            background: "rgba(231,76,60,0.1)", color: "#E74C3C", fontSize: 11, fontWeight: 600,
            fontFamily: "'Montserrat',sans-serif",
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div style={{
          display: "flex", gap: 4, padding: "12px 24px",
          borderBottom: "1px solid rgba(250,164,26,0.08)",
          background: "rgba(44,24,24,0.3)",
        }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 8, border: "none", cursor: "pointer",
                background: active ? "rgba(250,164,26,0.15)" : "transparent",
                color: active ? "#FAA41A" : "#9a8070",
                fontWeight: active ? 700 : 500, fontSize: 12, letterSpacing: "0.04em",
                fontFamily: "'Montserrat',sans-serif",
                transition: "all 0.2s",
              }}>
                <t.Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: 24 }}>
          {tab === "players" && <PlayerGrid fetch={fetch} />}
          {tab === "adjust" && <AdjustPoints fetch={fetch} />}
          {tab === "audit" && <AuditLog fetch={fetch} />}
        </div>
      </div>
    </>
  );
}
