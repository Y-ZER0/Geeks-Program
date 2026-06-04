import { useState, useEffect } from "react";
import { Loader, CheckCircle, AlertTriangle, Brain, Shield, Code, Zap } from "lucide-react";

const CATS = [
  { key:"AI",    label:"Artificial Intelligence", Icon:Brain  },
  { key:"Cyber", label:"Cybersecurity",           Icon:Shield },
  { key:"Web",   label:"Web Development",         Icon:Code   },
];

const INPUT_STYLE = (focused) => ({
  width:"100%", padding:"11px 14px", borderRadius:8, fontSize:13,
  background:"rgba(14,6,6,0.7)", color:"#F5E6D3",
  fontFamily:"'Montserrat',sans-serif", outline:"none",
  border: focused ? "1px solid #FAA41A" : "1px solid rgba(250,164,26,0.22)",
  boxShadow: focused ? "0 0 0 3px rgba(250,164,26,0.15)" : "none",
  transition:"border-color 0.2s, box-shadow 0.2s",
});

const Section = ({ label, children }) => (
  <div style={{ marginBottom:18 }}>
    <label style={{
      fontSize:10, color:"#D8BD82", fontWeight:700, display:"block",
      marginBottom:8, textTransform:"uppercase", letterSpacing:"0.09em",
    }}>
      {label}
    </label>
    {children}
  </div>
);

export default function AdjustPoints({ fetch }) {
  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [playerId, setPlayerId] = useState("");
  const [category, setCategory] = useState("AI");
  const [delta,    setDelta]    = useState("");
  const [note,     setNote]     = useState("");
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);
  const [focused,  setFocused]  = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/players");
        setPlayers(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setResult(null);
    const d = parseInt(delta);
    if (isNaN(d) || d === 0) { setError("Delta must be a non-zero integer"); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/players/${playerId}/points`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ category, delta:d, note:note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.updated);
      setDelta(""); setNote("");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const selectedPlayer = players.find(p => p.id === playerId);
  const deltaNum = parseInt(delta) || 0;
  const isPositive = deltaNum > 0;
  const isValid = !isNaN(parseInt(delta)) && parseInt(delta) !== 0;

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
    <div style={{ maxWidth:560 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:16, fontWeight:800, margin:"0 0 4px", letterSpacing:"0.04em" }}>Adjust Points</h2>
        <p style={{ fontSize:11, color:"#9a8070", margin:0 }}>
          Add or deduct points from a player's category score
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        background:"rgba(44,24,24,0.6)", borderRadius:14,
        border:"1px solid rgba(250,164,26,0.15)",
        overflow:"hidden",
      }}>
        {/* Form inner */}
        <div style={{ padding:"24px 24px 20px" }}>

          {/* Player */}
          <Section label="Player">
            <select
              value={playerId} onChange={e => { setPlayerId(e.target.value); setResult(null); }}
              onFocus={() => setFocused("player")} onBlur={() => setFocused("")}
              style={{
                ...INPUT_STYLE(focused === "player"),
                appearance:"none",
                backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a8070' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center",
                paddingRight:34,
              }}
            >
              <option value="">Select a player…</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.display_name}</option>
              ))}
            </select>
          </Section>

          {/* Current scores */}
          {selectedPlayer && (
            <div style={{
              background:"rgba(14,6,6,0.5)", borderRadius:9, padding:"12px 14px",
              marginBottom:18, border:"1px solid rgba(250,164,26,0.1)",
            }}>
              <div style={{ fontSize:10, color:"#9a8070", fontWeight:700, marginBottom:8,
                textTransform:"uppercase", letterSpacing:"0.08em" }}>
                Current Scores
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                {selectedPlayer.scores.map(s => {
                  const active = s.category === category;
                  return (
                    <div key={s.category} style={{
                      background: active ? "rgba(250,164,26,0.1)" : "rgba(44,24,24,0.5)",
                      border: `1px solid ${active ? "rgba(250,164,26,0.35)" : "rgba(250,164,26,0.08)"}`,
                      borderRadius:7, padding:"8px 10px",
                    }}>
                      <div style={{ fontSize:9, color: active ? "#FAA41A" : "#9a8070",
                        fontWeight:700, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                        {s.category}
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2, fontSize:10 }}>
                        <div><span style={{ color:"#9a8070", fontSize:8 }}>LIVE</span><br/>
                          <span style={{ color:"#F5E6D3", fontWeight:700 }}>{s.live_pts}</span></div>
                        <div><span style={{ color:"#9a8070", fontSize:8 }}>2W</span><br/>
                          <span style={{ color:"#D8BD82" }}>{s.biweekly_pts}</span></div>
                        <div><span style={{ color:"#9a8070", fontSize:8 }}>MO</span><br/>
                          <span style={{ color:"#D8BD82" }}>{s.monthly_pts}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category */}
          <Section label="Category">
            <div style={{ display:"flex", gap:8 }}>
              {CATS.map(c => {
                const active = category === c.key;
                return (
                  <button key={c.key} type="button" onClick={() => setCategory(c.key)} style={{
                    flex:1, padding:"10px 8px", borderRadius:8, cursor:"pointer",
                    background: active ? "rgba(250,164,26,0.14)" : "rgba(14,6,6,0.5)",
                    border:`1px solid ${active ? "#FAA41A" : "rgba(216,189,130,0.18)"}`,
                    color: active ? "#FAA41A" : "#9a8070",
                    fontWeight: active ? 700 : 500, fontSize:11, letterSpacing:"0.04em",
                    fontFamily:"'Montserrat',sans-serif",
                    transition:"all 0.2s",
                    boxShadow: active ? "0 0 12px rgba(250,164,26,0.2)" : "none",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                  }}>
                    <c.Icon size={14}/>
                    {c.key}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Delta */}
          <Section label="Points Adjustment">
            <div style={{ position:"relative" }}>
              <input
                type="number" value={delta} onChange={e => setDelta(e.target.value)}
                onFocus={() => setFocused("delta")} onBlur={() => setFocused("")}
                placeholder="e.g. 50 or -20"
                style={INPUT_STYLE(focused === "delta")}
              />
              {delta && (
                <div style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  fontSize:12, fontWeight:700,
                  color: isPositive ? "#2ECC71" : "#E74C3C",
                }}>
                  {isPositive ? "+" : ""}{deltaNum} pts
                </div>
              )}
            </div>
          </Section>

          {/* Note */}
          <Section label="Note (optional)">
            <input
              value={note} onChange={e => setNote(e.target.value)}
              onFocus={() => setFocused("note")} onBlur={() => setFocused("")}
              placeholder="Reason for adjustment…"
              style={INPUT_STYLE(focused === "note")}
            />
          </Section>

          {/* Preview */}
          {selectedPlayer && isValid && (
            <div style={{
              background: isPositive ? "rgba(46,204,113,0.07)" : "rgba(231,76,60,0.07)",
              border:`1px solid ${isPositive ? "rgba(46,204,113,0.2)" : "rgba(231,76,60,0.2)"}`,
              borderRadius:8, padding:"10px 14px", marginBottom:16,
              display:"flex", alignItems:"center", gap:8, fontSize:12,
            }}>
              <Zap size={13} color={isPositive ? "#2ECC71" : "#E74C3C"}/>
              <span style={{ color:"#D8BD82" }}>
                {isPositive ? "Adding" : "Deducting"}{" "}
                <strong style={{ color: isPositive ? "#2ECC71" : "#E74C3C" }}>
                  {Math.abs(deltaNum)} pts
                </strong>{" "}
                {isPositive ? "to" : "from"}{" "}
                <strong style={{ color:"#FAA41A" }}>{selectedPlayer.display_name}</strong>'s{" "}
                <strong style={{ color:"#D8BD82" }}>{category}</strong> score
              </span>
            </div>
          )}
        </div>

        {/* Feedback bar */}
        {(error || result) && (
          <div style={{ padding:"12px 24px", borderTop:"1px solid rgba(250,164,26,0.08)" }}>
            {error && (
              <div style={{
                display:"flex", alignItems:"center", gap:8, fontSize:12,
                color:"#F5C5C5", padding:"9px 12px",
                background:"rgba(231,76,60,0.1)", border:"1px solid rgba(231,76,60,0.25)",
                borderRadius:8,
              }}>
                <AlertTriangle size={13} color="#E74C3C" style={{ flexShrink:0 }}/>
                {error}
              </div>
            )}
            {result && (
              <div style={{
                display:"flex", alignItems:"center", gap:8, fontSize:12,
                color:"#C3F5D5", padding:"9px 12px",
                background:"rgba(46,204,113,0.08)", border:"1px solid rgba(46,204,113,0.25)",
                borderRadius:8,
              }}>
                <CheckCircle size={13} color="#2ECC71" style={{ flexShrink:0 }}/>
                <span>
                  Points updated — {result[0]?.category}:{" "}
                  Live <strong>{result[0]?.live_pts}</strong> ·{" "}
                  2W <strong>{result[0]?.biweekly_pts}</strong> ·{" "}
                  Mo <strong>{result[0]?.monthly_pts}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(250,164,26,0.08)", background:"rgba(14,6,6,0.25)" }}>
          <button type="submit" disabled={busy || !playerId || !isValid} style={{
            width:"100%", padding:"13px", borderRadius:9, border:"none",
            background: (busy || !playerId || !isValid)
              ? "rgba(250,164,26,0.15)"
              : "linear-gradient(135deg,#FAA41A,#FFD883)",
            color: (busy || !playerId || !isValid) ? "#9a8070" : "#2C1818",
            fontSize:13, fontWeight:800, letterSpacing:"0.06em",
            cursor: (busy || !playerId || !isValid) ? "not-allowed" : "pointer",
            fontFamily:"'Montserrat',sans-serif",
            boxShadow: (busy || !playerId || !isValid) ? "none" : "0 4px 18px rgba(250,164,26,0.3)",
            transition:"all 0.2s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>
            {busy
              ? <><div className="spin" style={{ width:14, height:14, border:"2px solid #9a8070", borderTopColor:"#2C1818", borderRadius:"50%" }}/> Updating…</>
              : "Apply Points"
            }
          </button>
        </div>
      </form>
    </div>
  );
}