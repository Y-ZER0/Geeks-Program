/**
 * SetupGuide Component
 * Placeholder shown when Sanity is not configured
 */

export function SetupGuide() {
  return (
    <div style={{
      maxWidth: 560,
      margin: "80px auto",
      padding: "0 20px",
      fontFamily: "'Montserrat',sans-serif",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔧</div>
      <h2 style={{
        fontSize: 22,
        fontWeight: 800,
        color: "#FAA41A",
        marginBottom: 8,
        letterSpacing: "0.04em",
      }}>
        Connect Sanity
      </h2>
      <p style={{
        color: "#D8BD82",
        fontSize: 13,
        lineHeight: 1.7,
        marginBottom: 24,
      }}>
        Open <code style={{
          background: "rgba(250,164,26,0.15)",
          padding: "2px 6px",
          borderRadius: 4,
          color: "#FAA41A",
        }}>
          .env.local
        </code> and set your Sanity credentials:
      </p>
      <div style={{
        background: "rgba(44,24,24,0.7)",
        border: "1px solid rgba(250,164,26,0.3)",
        borderRadius: 10,
        padding: "16px 20px",
        textAlign: "left",
        fontSize: 12,
        color: "#D8BD82",
        lineHeight: 2,
        fontFamily: "monospace",
      }}>
        <span style={{ color: "#9a8070" }}>// .env.local</span><br />
        <span style={{ color: "#A5F3FC" }}>VITE_SANITY_PROJECT_ID</span>=<span style={{ color: "#FAA41A" }}>"your_project_id"</span><br />
        <span style={{ color: "#A5F3FC" }}>VITE_SANITY_DATASET</span>=<span style={{ color: "#FAA41A" }}>"production"</span><br />
        <span style={{ color: "#A5F3FC" }}>VITE_SANITY_API_VERSION</span>=<span style={{ color: "#FAA41A" }}>"2024-01-01"</span>
      </div>
      <div style={{
        marginTop: 24,
        fontSize: 12,
        color: "#9a8070",
        lineHeight: 1.8,
      }}>
        Find your Project ID at <strong style={{ color: "#1C75BC" }}>sanity.io/manage</strong><br />
        Then allow your domain under <strong style={{ color: "#1C75BC" }}>Settings → API → CORS Origins</strong>
      </div>
    </div>
  );
}
