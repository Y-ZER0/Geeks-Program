import { useState, useEffect } from "react";
import { Loader, CheckCircle } from "lucide-react";

const CATEGORIES = ["AI", "Cyber", "Web"];

export default function AdjustPoints({ fetch }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerId, setPlayerId] = useState("");
  const [category, setCategory] = useState("AI");
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/players");
        const data = await res.json();
        setPlayers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const d = parseInt(delta);
    if (isNaN(d) || d === 0) {
      setError("Delta must be a non-zero integer");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/players/${playerId}/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, delta: d, note: note.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.updated);
      if (delta > 0) setDelta("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const selectedPlayer = players.find((p) => p.id === playerId);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Loader size={24} className="spin" color="#FAA41A" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 540 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Adjust Points</h2>

      <form onSubmit={handleSubmit} style={{
        background: "rgba(44,24,24,0.5)", borderRadius: 12, padding: 24,
        border: "1px solid rgba(250,164,26,0.12)",
      }}>
        {/* Player select */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#D8BD82", fontWeight: 600, display: "block", marginBottom: 6 }}>Player</label>
          <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} style={{
            width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(250,164,26,0.25)",
            background: "rgba(22,12,12,0.6)", color: "#F5E6D3", fontSize: 13,
            outline: "none", fontFamily: "'Montserrat',sans-serif",
          }}>
            <option value="">Select a player...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.display_name}</option>
            ))}
          </select>
        </div>

        {/* Current scores */}
        {selectedPlayer && (
          <div style={{
            background: "rgba(22,12,12,0.4)", borderRadius: 8, padding: 12, marginBottom: 16,
            fontSize: 11, color: "#9a8070",
          }}>
            <div style={{ fontWeight: 600, color: "#D8BD82", marginBottom: 6 }}>Current Scores:</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {selectedPlayer.scores.map((s) => (
                <div key={s.category}>
                  <strong style={{ color: "#FAA41A" }}>{s.category}</strong>: L:{s.live_pts} / B:{s.biweekly_pts} / M:{s.monthly_pts}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#D8BD82", fontWeight: 600, display: "block", marginBottom: 6 }}>Category</label>
          <div style={{ display: "flex", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} style={{
                flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid",
                cursor: "pointer", fontSize: 12, fontWeight: category === c ? 700 : 500,
                background: category === c ? "rgba(250,164,26,0.15)" : "transparent",
                borderColor: category === c ? "#FAA41A" : "rgba(216,189,130,0.25)",
                color: category === c ? "#FAA41A" : "#D8BD82",
                fontFamily: "'Montserrat',sans-serif",
              }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Delta */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: "#D8BD82", fontWeight: 600, display: "block", marginBottom: 6 }}>
            Points (positive to add, negative to deduct)
          </label>
          <input
            type="number" value={delta} onChange={(e) => setDelta(e.target.value)}
            placeholder="e.g. 50 or -20"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(250,164,26,0.25)",
              background: "rgba(22,12,12,0.6)", color: "#F5E6D3", fontSize: 13,
              outline: "none", fontFamily: "'Montserrat',sans-serif",
            }}
          />
        </div>

        {/* Note */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: "#D8BD82", fontWeight: 600, display: "block", marginBottom: 6 }}>Note (optional)</label>
          <input
            value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for adjustment"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(250,164,26,0.25)",
              background: "rgba(22,12,12,0.6)", color: "#F5E6D3", fontSize: 13,
              outline: "none", fontFamily: "'Montserrat',sans-serif",
            }}
          />
        </div>

        {error && (
          <div style={{
            color: "#E74C3C", fontSize: 12, marginBottom: 12, padding: "8px 12px",
            background: "rgba(231,76,60,0.1)", borderRadius: 6, border: "1px solid rgba(231,76,60,0.3)",
          }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, color: "#2ECC71", fontSize: 12,
            marginBottom: 12, padding: "8px 12px", background: "rgba(46,204,113,0.1)",
            borderRadius: 6, border: "1px solid rgba(46,204,113,0.3)",
          }}>
            <CheckCircle size={14} />
            Points updated! {result[0]?.category}: L={result[0]?.live_pts} / B={result[0]?.biweekly_pts} / M={result[0]?.monthly_pts}
          </div>
        )}

        <button type="submit" disabled={busy || !playerId} style={{
          width: "100%", padding: "12px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg,#FAA41A,#FFD883)",
          color: "#2C1818", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
          cursor: (busy || !playerId) ? "not-allowed" : "pointer", opacity: (busy || !playerId) ? 0.6 : 1,
          fontFamily: "'Montserrat',sans-serif",
        }}>
          {busy ? "Updating..." : "Apply Points"}
        </button>
      </form>
    </div>
  );
}
