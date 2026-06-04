import { useState, useEffect } from "react";
import { Plus, Loader, X, Crown, Users } from "lucide-react";
import { getTier } from "../../utils/tiers";

const TIER_COLORS = {
  "Geeks Master": "#FFD883",
  "Geek":         "#C084FC",
  "Platinum":     "#A5F3FC",
  "Gold":         "#FFD700",
  "Silver":       "#D1D5DB",
  "Bronze":       "#CD7F32",
};

const liveTotal = (scores) => scores.reduce((s, c) => s + c.live_pts, 0);

const initials = (name) =>
  name ? name.split(/[\s_-]/).map(w => w[0]).join("").toUpperCase().slice(0, 2) : "??";

export default function PlayerGrid({ fetch }) {
  const [players, setPlayers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName]       = useState("");
  const [creating, setCreating]     = useState(false);
  const [nameFocused, setNameFocused] = useState(false);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/players");
      setPlayers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPlayers(); }, []);

  const createPlayer = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/admin/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: newName.trim() }),
      });
      setNewName(""); setShowCreate(false); loadPlayers();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:80, color:"#9a8070" }}>
      <div className="spin" style={{
        width:28, height:28, border:"2px solid rgba(250,164,26,0.15)",
        borderTopColor:"#FAA41A", borderRadius:"50%",
      }}/>
      <span style={{ fontSize:12 }}>Loading players…</span>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:800, margin:"0 0 2px", letterSpacing:"0.04em" }}>Players</h2>
          <div style={{ fontSize:11, color:"#9a8070" }}>
            <Users size={11} style={{ verticalAlign:-1, marginRight:4 }}/>
            {players.length} registered
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
            borderRadius:9, border:"none", cursor:"pointer",
            background:"linear-gradient(135deg,#FAA41A,#FFD883)",
            color:"#2C1818", fontSize:12, fontWeight:700,
            fontFamily:"'Montserrat',sans-serif", letterSpacing:"0.04em",
            boxShadow:"0 4px 16px rgba(250,164,26,0.35)",
            transition:"box-shadow 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 24px rgba(250,164,26,0.55)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow="0 4px 16px rgba(250,164,26,0.35)"}
        >
          <Plus size={14}/> Add Player
        </button>
      </div>

      {/* Create panel */}
      {showCreate && (
        <div style={{
          marginBottom:20, padding:"18px 20px",
          background:"rgba(44,24,24,0.65)", borderRadius:12,
          border:"1px solid rgba(250,164,26,0.25)",
          boxShadow:"0 0 0 1px rgba(250,164,26,0.08)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:12, fontWeight:700, color:"#D8BD82", textTransform:"uppercase", letterSpacing:"0.06em" }}>
              New Player
            </span>
            <button onClick={() => setShowCreate(false)} style={{
              background:"none", border:"none", cursor:"pointer", color:"#9a8070",
              padding:4, display:"flex",
            }}>
              <X size={15}/>
            </button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createPlayer()}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Display name (e.g. geek_prime)"
              autoFocus
              style={{
                flex:1, padding:"10px 14px", borderRadius:8, fontSize:13,
                background:"rgba(14,6,6,0.7)", color:"#F5E6D3",
                fontFamily:"'Montserrat',sans-serif", outline:"none",
                border: nameFocused
                  ? "1px solid #FAA41A"
                  : "1px solid rgba(250,164,26,0.22)",
                boxShadow: nameFocused ? "0 0 0 3px rgba(250,164,26,0.15)" : "none",
                transition:"border-color 0.2s, box-shadow 0.2s",
              }}
            />
            <button onClick={createPlayer} disabled={creating || !newName.trim()} style={{
              padding:"10px 20px", borderRadius:8, border:"none", cursor:"pointer",
              background: !newName.trim() ? "rgba(250,164,26,0.2)" : "linear-gradient(135deg,#FAA41A,#FFD883)",
              color: !newName.trim() ? "#9a8070" : "#2C1818",
              fontWeight:700, fontSize:12, fontFamily:"'Montserrat',sans-serif",
              transition:"all 0.2s", whiteSpace:"nowrap",
            }}>
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{ display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))" }}>
        {players.map((p, idx) => {
          const lv = liveTotal(p.scores);
          const tier = getTier(lv);
          const tc = TIER_COLORS[tier.name] || "#CD7F32";
          return (
            <div key={p.id} style={{
              background:"rgba(44,24,24,0.6)", borderRadius:12,
              border:"1px solid rgba(250,164,26,0.1)",
              borderTop:`2px solid ${tc}88`,
              overflow:"hidden",
              transition:"transform 0.2s ease, box-shadow 0.2s ease",
              animation:`rowIn 0.3s ease ${idx * 0.04}s both`,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px ${tc}33`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Card header */}
              <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:`linear-gradient(135deg,${tc}22,${tc}44)`,
                  border:`2px solid ${tc}77`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:800, color:tc,
                  boxShadow:`0 0 12px ${tc}33`,
                }}>
                  {initials(p.display_name)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#F5E6D3", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {p.display_name}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{
                      fontSize:9, fontWeight:700, padding:"1px 7px", borderRadius:4,
                      color:tc, background:`${tc}18`, border:`1px solid ${tc}44`,
                      textTransform:"uppercase", letterSpacing:"0.06em",
                    }}>
                      {tier.name}
                    </span>
                    <span style={{ fontSize:10, color:"#9a8070" }}>
                      {lv.toLocaleString()} pts live
                    </span>
                  </div>
                </div>
                {idx === 0 && <Crown size={16} color="#FAA41A" style={{ flexShrink:0 }}/>}
              </div>

              {/* Score breakdown */}
              <div style={{
                padding:"10px 16px 14px",
                borderTop:"1px solid rgba(250,164,26,0.08)",
                display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6,
              }}>
                {p.scores.map((s) => (
                  <div key={s.category} style={{
                    background:"rgba(14,6,6,0.5)", borderRadius:7, padding:"7px 8px", textAlign:"center",
                  }}>
                    <div style={{ fontSize:9, color:"#9a8070", marginBottom:3, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                      {s.category}
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#FAA41A" }}>{s.live_pts}</div>
                    <div style={{ fontSize:9, color:"#9a8070", marginTop:1 }}>
                      {s.biweekly_pts}<span style={{ margin:"0 2px" }}>·</span>{s.monthly_pts}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes rowIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}