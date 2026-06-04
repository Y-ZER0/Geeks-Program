import { useState, useEffect } from "react";
import { Loader, ChevronLeft, ChevronRight } from "lucide-react";

export default function AuditLog({ fetch }) {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 25;

  const loadEvents = async (pageNum) => {
    setLoading(true);
    try {
      const offset = pageNum * limit;
      const res = await fetch(`/api/admin/audit-log?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(page); }, [page]);

  const totalPages = Math.ceil(total / limit);

  const getInitials = (name) =>
    name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Audit Log</h2>
        <span style={{ fontSize: 11, color: "#9a8070" }}>{total} total events</span>
      </div>

      <div style={{
        background: "rgba(44,24,24,0.5)", borderRadius: 12,
        border: "1px solid rgba(250,164,26,0.12)", overflow: "hidden",
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 120px 60px",
          padding: "10px 16px", gap: 8,
          background: "rgba(250,164,26,0.08)",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "#D8BD82",
        }}>
          <span></span>
          <span>Player</span>
          <span style={{ textAlign: "center" }}>Category</span>
          <span style={{ textAlign: "center" }}>Points</span>
          <span>Note</span>
          <span style={{ textAlign: "right" }}>Date</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Loader size={20} className="spin" color="#FAA41A" />
          </div>
        ) : (
          events.map((e) => (
            <div key={e.id} style={{
              display: "grid", gridTemplateColumns: "40px 1fr 80px 80px 120px 60px",
              padding: "10px 16px", gap: 8, alignItems: "center",
              borderBottom: "1px solid rgba(250,164,26,0.06)",
              fontSize: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: e.delta > 0 ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)",
                border: `1px solid ${e.delta > 0 ? "rgba(46,204,113,0.3)" : "rgba(231,76,60,0.3)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                color: e.delta > 0 ? "#2ECC71" : "#E74C3C",
              }}>
                {getInitials(e.admin_username || "Admin")}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{e.player_name}</div>
                {e.admin_username && <div style={{ fontSize: 10, color: "#9a8070" }}>by {e.admin_username}</div>}
              </div>
              <div style={{ textAlign: "center", color: "#9a8070", fontSize: 11 }}>{e.category}</div>
              <div style={{
                textAlign: "center", fontWeight: 700,
                color: e.delta > 0 ? "#2ECC71" : "#E74C3C",
              }}>
                {e.delta > 0 ? "+" : ""}{e.delta}
              </div>
              <div style={{ fontSize: 11, color: "#9a8070", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {e.note || "—"}
              </div>
              <div style={{ textAlign: "right", fontSize: 10, color: "#9a8070" }}>
                {new Date(e.event_date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6,
            border: "1px solid rgba(250,164,26,0.2)", cursor: page === 0 ? "not-allowed" : "pointer",
            background: "rgba(44,24,24,0.5)", color: page === 0 ? "#9a8070" : "#D8BD82",
            fontSize: 11, fontFamily: "'Montserrat',sans-serif", opacity: page === 0 ? 0.5 : 1,
          }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: 11, color: "#9a8070", display: "flex", alignItems: "center" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} style={{
            display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6,
            border: "1px solid rgba(250,164,26,0.2)", cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
            background: "rgba(44,24,24,0.5)", color: page >= totalPages - 1 ? "#9a8070" : "#D8BD82",
            fontSize: 11, fontFamily: "'Montserrat',sans-serif", opacity: page >= totalPages - 1 ? 0.5 : 1,
          }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
