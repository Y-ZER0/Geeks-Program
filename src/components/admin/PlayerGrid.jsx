import { useState, useEffect } from "react";
import { Plus, Loader } from "lucide-react";
import { getTier } from "../../utils/tiers";

export default function PlayerGrid({ fetch }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/players");
      const data = await res.json();
      setPlayers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlayers(); }, []);

  const createPlayer = async () => {
    if (!newName.trim()) return;
    try {
      await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: newName.trim() }),
      });
      setNewName("");
      setShowCreate(false);
      loadPlayers();
    } catch (e) {
      console.error(e);
    }
  };

  const liveTotal = (scores) =>
    scores.reduce((sum, s) => sum + s.live_pts, 0);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Loader size={24} className="spin" color="#FAA41A" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Players</h2>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
          borderRadius: 8, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg,#FAA41A,#FFD883)", color: "#2C1818",
          fontSize: 12, fontWeight: 700, fontFamily: "'Montserrat',sans-serif",
        }}>
          <Plus size={14} /> Add Player
        </button>
      </div>

      {showCreate && (
        <div style={{
          display: "flex", gap: 8, marginBottom: 20, padding: 16,
          background: "rgba(44,24,24,0.5)", borderRadius: 10,
          border: "1px solid rgba(250,164,26,0.15)",
        }}>
          <input
            value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Player display name"
            onKeyDown={(e) => e.key === "Enter" && createPlayer()}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(250,164,26,0.25)",
              background: "rgba(22,12,12,0.6)", color: "#F5E6D3", fontSize: 13,
              outline: "none", fontFamily: "'Montserrat',sans-serif",
            }}
            autoFocus
          />
          <button onClick={createPlayer} style={{
            padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg,#FAA41A,#FFD883)", color: "#2C1818",
            fontWeight: 700, fontSize: 12, fontFamily: "'Montserrat',sans-serif",
          }}>
            Create
          </button>
        </div>
      )}

      <div style={{
        display: "grid", gap: 12,
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}>
        {players.map((p) => {
          const lv = liveTotal(p.scores);
          const tier = getTier(lv);
          return (
            <div key={p.id} style={{
              background: "rgba(44,24,24,0.5)", borderRadius: 12, padding: 16,
              border: "1px solid rgba(250,164,26,0.12)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg,${tier.color}22,${tier.color}55)`,
                  border: `2px solid ${tier.color}66`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: tier.color,
                }}>
                  {p.display_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.display_name}</div>
                  <div style={{ fontSize: 10, color: "#9a8070" }}>Live: <span style={{ color: "#FAA41A", fontWeight: 700 }}>{lv.toLocaleString()}</span></div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {p.scores.map((s) => (
                  <div key={s.category} style={{
                    background: "rgba(22,12,12,0.4)", borderRadius: 6, padding: "6px 8px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 9, color: "#9a8070", marginBottom: 2 }}>{s.category}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#D8BD82" }}>
                      {s.live_pts}<span style={{ color: "#9a8070", fontWeight: 400 }}>/{s.biweekly_pts}/{s.monthly_pts}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
