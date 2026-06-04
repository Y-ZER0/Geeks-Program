import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import { Shield, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

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
      }}>
        <form onSubmit={handleSubmit} style={{
          width: "100%", maxWidth: 380, padding: "40px 32px",
          background: "rgba(44,24,24,0.7)", backdropFilter: "blur(16px)",
          borderRadius: 16, border: "1px solid rgba(250,164,26,0.2)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Shield size={36} color="#FAA41A" style={{ marginBottom: 12 }} />
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#F5E6D3", letterSpacing: "0.06em", margin: 0 }}>
              Admin Login
            </h1>
            <p style={{ fontSize: 11, color: "#9a8070", marginTop: 6 }}>
              Geeks Program Management
            </p>
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.3)",
              borderRadius: 8, padding: "10px 12px", marginBottom: 16, fontSize: 12, color: "#F5E6D3",
            }}>
              <AlertTriangle size={14} color="#E74C3C" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: "#D8BD82", fontWeight: 600, display: "block", marginBottom: 6 }}>Username</label>
            <input
              value={username} onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(250,164,26,0.25)",
                background: "rgba(22,12,12,0.6)", color: "#F5E6D3", fontSize: 13,
                outline: "none", fontFamily: "'Montserrat',sans-serif",
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: "#D8BD82", fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(250,164,26,0.25)",
                  background: "rgba(22,12,12,0.6)", color: "#F5E6D3", fontSize: 13,
                  outline: "none", fontFamily: "'Montserrat',sans-serif",
                  paddingRight: 40,
                }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#9a8070", padding: 4,
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={busy} style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg,#FAA41A,#FFD883)",
            color: "#2C1818", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
            cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
            fontFamily: "'Montserrat',sans-serif",
          }}>
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </>
  );
}
