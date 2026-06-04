import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { Shield, AlertTriangle, Eye, EyeOff, Zap } from "lucide-react";

const INPUT_BASE = {
  width: "100%", padding: "11px 14px", borderRadius: 8,
  border: "1px solid rgba(250,164,26,0.22)",
  background: "rgba(14,6,6,0.7)", color: "#F5E6D3", fontSize: 13,
  outline: "none", fontFamily: "'Montserrat',sans-serif",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [busy, setBusy]         = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [focused, setFocused]   = useState("");

  const focusStyle = (field) => focused === field
    ? { ...INPUT_BASE, borderColor: "#FAA41A", boxShadow: "0 0 0 3px rgba(250,164,26,0.18)" }
    : INPUT_BASE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login — Geeks Program Leaderboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(155deg,#6D2E2E 0%,#2C1818 45%,#160C0C 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Montserrat',sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
          *{box-sizing:border-box}
          @keyframes loginIn{from{opacity:0;transform:translateY(20px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
          @keyframes pulseOrb{0%,100%{opacity:0.12;transform:scale(1)}50%{opacity:0.22;transform:scale(1.08)}}
          @keyframes spin{to{transform:rotate(360deg)}}
          .spin{animation:spin 0.8s linear infinite}
        `}</style>

        {/* Ambient glow orbs */}
        <div style={{ position:"fixed", top:"10%", left:"10%", width:400, height:400, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(250,164,26,0.15) 0%,transparent 70%)",
          animation:"pulseOrb 4s ease-in-out infinite", pointerEvents:"none" }}/>
        <div style={{ position:"fixed", bottom:"10%", right:"10%", width:300, height:300, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(28,117,188,0.1) 0%,transparent 70%)",
          animation:"pulseOrb 4s ease-in-out 2s infinite", pointerEvents:"none" }}/>

        <form onSubmit={handleSubmit} style={{
          width:"100%", maxWidth:400, padding:"40px 36px",
          background:"rgba(44,24,24,0.75)", backdropFilter:"blur(20px)",
          borderRadius:16, border:"1px solid rgba(250,164,26,0.22)",
          boxShadow:"0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(250,164,26,0.08)",
          animation:"loginIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
          position:"relative", zIndex:1,
        }}>
          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{
              width:64, height:64, borderRadius:"50%", margin:"0 auto 16px",
              background:"rgba(250,164,26,0.12)",
              border:"1px solid rgba(250,164,26,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 24px rgba(250,164,26,0.25)",
            }}>
              <Shield size={28} color="#FAA41A" />
            </div>
            <h1 style={{
              fontSize:20, fontWeight:800, letterSpacing:"0.08em",
              color:"#F5E6D3", margin:"0 0 6px",
            }}>
              ADMIN LOGIN
            </h1>
            <p style={{ fontSize:11, color:"#9a8070", margin:0, letterSpacing:"0.04em" }}>
              Geeks Program Management
            </p>
          </div>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:24 }}>
            <div style={{ flex:1, height:1, background:"linear-gradient(to right,transparent,rgba(250,164,26,0.3))" }}/>
            <Zap size={12} color="rgba(250,164,26,0.5)"/>
            <div style={{ flex:1, height:1, background:"linear-gradient(to left,transparent,rgba(250,164,26,0.3))" }}/>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              display:"flex", alignItems:"center", gap:8,
              background:"rgba(231,76,60,0.1)", border:"1px solid rgba(231,76,60,0.3)",
              borderRadius:8, padding:"10px 12px", marginBottom:16,
              fontSize:12, color:"#F5C5C5",
            }}>
              <AlertTriangle size={14} color="#E74C3C" style={{ flexShrink:0 }}/>
              <span>{error}</span>
            </div>
          )}

          {/* Username */}
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, color:"#D8BD82", fontWeight:700, display:"block",
              marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Username
            </label>
            <input
              value={username} onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused("user")} onBlur={() => setFocused("")}
              style={focusStyle("user")}
              autoFocus autoComplete="username"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:10, color:"#D8BD82", fontWeight:700, display:"block",
              marginBottom:6, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Password
            </label>
            <div style={{ position:"relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("pass")} onBlur={() => setFocused("")}
                style={{ ...focusStyle("pass"), paddingRight:42 }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", color:"#9a8070",
                padding:4, display:"flex", alignItems:"center",
                transition:"color 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.color="#D8BD82"}
                onMouseLeave={e => e.currentTarget.style.color="#9a8070"}
              >
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={busy || !username || !password} style={{
            width:"100%", padding:"13px", borderRadius:9, border:"none",
            background: (busy || !username || !password)
              ? "rgba(250,164,26,0.25)"
              : "linear-gradient(135deg,#FAA41A,#FFD883)",
            color: (busy || !username || !password) ? "#9a8070" : "#2C1818",
            fontSize:13, fontWeight:800, letterSpacing:"0.08em",
            cursor: (busy || !username || !password) ? "not-allowed" : "pointer",
            fontFamily:"'Montserrat',sans-serif",
            transition:"all 0.2s",
            boxShadow: (busy || !username || !password) ? "none" : "0 4px 20px rgba(250,164,26,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}
            onMouseEnter={e => { if (!busy && username && password) e.currentTarget.style.boxShadow="0 6px 28px rgba(250,164,26,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow="0 4px 20px rgba(250,164,26,0.35)"; }}
          >
            {busy
              ? <><span className="spin" style={{ display:"inline-block", width:14, height:14, border:"2px solid #9a8070", borderTopColor:"#FAA41A", borderRadius:"50%" }}/> Signing in...</>
              : "Sign In"
            }
          </button>
        </form>
      </div>
    </>
  );
}