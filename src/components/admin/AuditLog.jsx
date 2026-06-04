import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, History } from "lucide-react";

const limit = 25;

const initials = (name) =>
  name ? name.split(/[\s_]/).map(w => w[0]).join("").toUpperCase().slice(0, 2) : "??";

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day:"2-digit", month:"short" });
};

const CAT_COLORS = {
  AI:    "#C084FC",
  Cyber: "#60A5FA",
  Web:   "#34D399",
};

export default function AuditLog({ fetch }) {
  const [events,  setEvents]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(0);
  const [hoveredRow, setHoveredRow] = useState(null);

  const loadEvents = async (pageNum) => {
    setLoading(true);
    try {
      const offset = pageNum * limit;
      const res = await fetch(`/api/admin/audit-log?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEvents(page); }, [page]);

  const totalPages = Math.ceil(total / limit);
  const from = page * limit + 1;
  const to   = Math.min((page + 1) * limit, total);

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:16, fontWeight:800, margin:"0 0 2px", letterSpacing:"0.04em" }}>Audit Log</h2>
          <div style={{ fontSize:11, color:"#9a8070" }}>
            <History size={11} style={{ verticalAlign:-1, marginRight:4 }}/>
            {total > 0 ? `${total.toLocaleString()} total events` : "No events yet"}
          </div>
        </div>
        {total > 0 && (
          <div style={{ fontSize:11, color:"#9a8070" }}>
            Showing {from}–{to}
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background:"rgba(44,24,24,0.55)", borderRadius:12,
        border:"1px solid rgba(250,164,26,0.13)", overflow:"hidden",
      }}>
        {/* Table header */}
        <div style={{
          display:"grid", gridTemplateColumns:"44px 1fr 80px 90px 1fr 72px",
          padding:"10px 18px", gap:8,
          background:"rgba(250,164,26,0.08)",
          borderBottom:"1px solid rgba(250,164,26,0.12)",
          fontSize:10, fontWeight:700, letterSpacing:"0.1em",
          textTransform:"uppercase", color:"#D8BD82",
          alignItems:"center",
        }}>
          <span/>
          <span>Player / Admin</span>
          <span style={{ textAlign:"center" }}>Category</span>
          <span style={{ textAlign:"center" }}>Change</span>
          <span>Note</span>
          <span style={{ textAlign:"right" }}>Date</span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:56, color:"#9a8070" }}>
            <div className="spin" style={{
              width:24, height:24, border:"2px solid rgba(250,164,26,0.12)",
              borderTopColor:"#FAA41A", borderRadius:"50%",
            }}/>
            <span style={{ fontSize:12 }}>Loading events…</span>
          </div>
        )}

        {/* Empty */}
        {!loading && events.length === 0 && (
          <div style={{ textAlign:"center", padding:"52px 24px", color:"#9a8070" }}>
            <History size={32} style={{ opacity:0.3, marginBottom:12 }}/>
            <p style={{ fontSize:13, margin:0 }}>No audit events found</p>
          </div>
        )}

        {/* Rows */}
        {!loading && events.map((e, i) => {
          const positive = e.delta > 0;
          const cc = CAT_COLORS[e.category] || "#D8BD82";
          const hovered = hoveredRow === e.id;
          return (
            <div
              key={e.id}
              onMouseEnter={() => setHoveredRow(e.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display:"grid", gridTemplateColumns:"44px 1fr 80px 90px 1fr 72px",
                padding:"11px 18px", gap:8, alignItems:"center",
                borderBottom:"1px solid rgba(250,164,26,0.05)",
                background: hovered ? "rgba(250,164,26,0.05)" : i%2===0 ? "rgba(44,24,24,0.15)" : "transparent",
                transition:"background 0.15s",
                animation:`rowIn 0.25s ease ${i*0.03}s both`,
              }}
            >
              {/* Admin avatar */}
              <div style={{
                width:32, height:32, borderRadius:8, flexShrink:0,
                background: positive ? "rgba(46,204,113,0.12)" : "rgba(231,76,60,0.12)",
                border:`1px solid ${positive ? "rgba(46,204,113,0.25)" : "rgba(231,76,60,0.25)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:800,
                color: positive ? "#2ECC71" : "#E74C3C",
              }}>
                {initials(e.admin_username || "Admin")}
              </div>

              {/* Player + admin */}
              <div>
                <div style={{ fontWeight:700, fontSize:12, color:"#F5E6D3", marginBottom:1 }}>
                  {e.player_name}
                </div>
                {e.admin_username && (
                  <div style={{ fontSize:10, color:"#9a8070" }}>by {e.admin_username}</div>
                )}
              </div>

              {/* Category pill */}
              <div style={{ textAlign:"center" }}>
                <span style={{
                  fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:5,
                  color:cc, background:`${cc}18`, border:`1px solid ${cc}44`,
                  letterSpacing:"0.04em",
                }}>
                  {e.category}
                </span>
              </div>

              {/* Delta */}
              <div style={{
                textAlign:"center", display:"flex", alignItems:"center",
                justifyContent:"center", gap:4,
              }}>
                {positive
                  ? <TrendingUp size={12} color="#2ECC71"/>
                  : <TrendingDown size={12} color="#E74C3C"/>
                }
                <span style={{
                  fontWeight:800, fontSize:13,
                  color: positive ? "#2ECC71" : "#E74C3C",
                }}>
                  {positive ? "+" : ""}{e.delta}
                </span>
              </div>

              {/* Note */}
              <div style={{
                fontSize:11, color:"#9a8070",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                {e.note
                  ? <span style={{ color:"#D8BD82" }}>{e.note}</span>
                  : <span style={{ fontStyle:"italic" }}>—</span>
                }
              </div>

              {/* Date */}
              <div style={{ textAlign:"right", fontSize:10, color:"#9a8070" }}>
                {fmtDate(e.event_date)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:18 }}>
          <button
            onClick={() => setPage(Math.max(0, page-1))}
            disabled={page === 0}
            style={{
              display:"flex", alignItems:"center", gap:4, padding:"7px 14px",
              borderRadius:8, cursor: page === 0 ? "not-allowed" : "pointer",
              background:"rgba(44,24,24,0.6)",
              border:"1px solid rgba(250,164,26,0.2)",
              color: page === 0 ? "#9a8070" : "#D8BD82",
              fontSize:11, fontWeight:600, fontFamily:"'Montserrat',sans-serif",
              opacity: page === 0 ? 0.45 : 1,
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { if(page!==0) e.currentTarget.style.borderColor="rgba(250,164,26,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(250,164,26,0.2)"; }}
          >
            <ChevronLeft size={13}/> Prev
          </button>

          {/* Page numbers (up to 5 visible) */}
          <div style={{ display:"flex", gap:4 }}>
            {Array.from({ length:Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(0, Math.min(page-2, totalPages-5)) + i;
              return (
                <button key={p} onClick={() => setPage(p)} style={{
                  width:32, height:32, borderRadius:7,
                  border:"1px solid",
                  borderColor: page===p ? "#FAA41A" : "rgba(250,164,26,0.18)",
                  background: page===p ? "rgba(250,164,26,0.15)" : "rgba(44,24,24,0.5)",
                  color: page===p ? "#FAA41A" : "#9a8070",
                  fontSize:11, fontWeight: page===p ? 700 : 500,
                  cursor:"pointer", fontFamily:"'Montserrat',sans-serif",
                  transition:"all 0.15s",
                }}>
                  {p+1}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages-1, page+1))}
            disabled={page >= totalPages-1}
            style={{
              display:"flex", alignItems:"center", gap:4, padding:"7px 14px",
              borderRadius:8, cursor: page>=totalPages-1 ? "not-allowed" : "pointer",
              background:"rgba(44,24,24,0.6)",
              border:"1px solid rgba(250,164,26,0.2)",
              color: page>=totalPages-1 ? "#9a8070" : "#D8BD82",
              fontSize:11, fontWeight:600, fontFamily:"'Montserrat',sans-serif",
              opacity: page>=totalPages-1 ? 0.45 : 1,
              transition:"all 0.2s",
            }}
            onMouseEnter={e => { if(page<totalPages-1) e.currentTarget.style.borderColor="rgba(250,164,26,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(250,164,26,0.2)"; }}
          >
            Next <ChevronRight size={13}/>
          </button>
        </div>
      )}

      <style>{`@keyframes rowIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}