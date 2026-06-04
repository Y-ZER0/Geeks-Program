import { Helmet } from "react-helmet-async";
import { useState, useCallback } from "react";
import { useAuth, useApi } from "../../hooks/useAuth.jsx";
import PlayerGrid from "./PlayerGrid";
import AdjustPoints from "./AdjustPoints";
import AuditLog from "./AuditLog";
import { LogOut, Users, PlusCircle, History, Zap } from "lucide-react";

const TABS = [
  { key:"players", label:"Players",      Icon:Users       },
  { key:"adjust",  label:"Adjust Points", Icon:PlusCircle  },
  { key:"audit",   label:"Audit Log",     Icon:History     },
];

export default function DashboardPage() {
  const { admin, logout } = useAuth();
  const { fetch } = useApi();
  const [tab, setTab] = useState("players");

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
        minHeight:"100vh",
        background:"linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
        fontFamily:"'Montserrat',sans-serif", color:"#F5E6D3",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          *{box-sizing:border-box}
          ::-webkit-scrollbar{width:5px}
          ::-webkit-scrollbar-track{background:#160C0C}
          ::-webkit-scrollbar-thumb{background:#FAA41A;border-radius:3px}
          @keyframes spin{to{transform:rotate(360deg)}}
          .spin{animation:spin 0.8s linear infinite}
          .tab-nav-btn{transition:all 0.2s ease;cursor:pointer;border:none;position:relative;font-family:'Montserrat',sans-serif}
          .tab-nav-btn:hover{background:rgba(250,164,26,0.08) !important;color:#D8BD82 !important}
          .logout-btn{transition:all 0.2s}
          .logout-btn:hover{background:rgba(231,76,60,0.2) !important;border-color:rgba(231,76,60,0.6) !important}
        `}</style>

        {/* ── TOPBAR ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", height:60,
          background:"rgba(28,12,12,0.85)", backdropFilter:"blur(16px)",
          borderBottom:"1px solid rgba(250,164,26,0.15)",
          position:"sticky", top:0, zIndex:100,
        }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:8,
              background:"rgba(250,164,26,0.12)", border:"1px solid rgba(250,164,26,0.25)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Zap size={16} color="#FAA41A"/>
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, letterSpacing:"0.08em", color:"#FAA41A", lineHeight:1.1 }}>
                GEEKS PROGRAM
              </div>
              <div style={{ fontSize:9, fontWeight:500, color:"#9a8070", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                Admin Panel
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:8, padding:"6px 12px",
              background:"rgba(44,24,24,0.6)", borderRadius:8,
              border:"1px solid rgba(250,164,26,0.12)",
            }}>
              <div style={{
                width:26, height:26, borderRadius:"50%",
                background:"linear-gradient(135deg,rgba(250,164,26,0.3),rgba(250,164,26,0.1))",
                border:"1px solid rgba(250,164,26,0.4)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:800, color:"#FAA41A",
              }}>
                {admin?.username?.slice(0,2).toUpperCase() || "AD"}
              </div>
              <span style={{ fontSize:12, fontWeight:600, color:"#D8BD82" }}>
                {admin?.username || "Admin"}
              </span>
            </div>

            <button onClick={handleLogout} className="logout-btn" style={{
              display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
              borderRadius:8, border:"1px solid rgba(231,76,60,0.35)", cursor:"pointer",
              background:"rgba(231,76,60,0.08)", color:"#E74C3C",
              fontSize:11, fontWeight:600, fontFamily:"'Montserrat',sans-serif",
            }}>
              <LogOut size={13}/> Logout
            </button>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div style={{
          display:"flex", gap:2, padding:"0 24px",
          background:"rgba(22,10,10,0.6)", backdropFilter:"blur(8px)",
          borderBottom:"1px solid rgba(250,164,26,0.1)",
        }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="tab-nav-btn" style={{
                display:"flex", alignItems:"center", gap:7, padding:"14px 18px",
                background:"transparent",
                color: active ? "#FAA41A" : "#9a8070",
                fontWeight: active ? 700 : 500, fontSize:12, letterSpacing:"0.04em",
                textTransform:"uppercase",
                borderBottom: active ? "2px solid #FAA41A" : "2px solid transparent",
                marginBottom:-1,
              }}>
                <t.Icon size={14}/> {t.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div style={{
          maxWidth:1120, margin:"0 auto", padding:"32px 28px",
        }}>
          {tab === "players" && <PlayerGrid fetch={fetch}/>}
          {tab === "adjust"  && <AdjustPoints fetch={fetch}/>}
          {tab === "audit"   && <AuditLog fetch={fetch}/>}
        </div>
      </div>
    </>
  );
}