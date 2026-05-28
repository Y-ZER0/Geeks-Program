/**
 * SkeletonRow Component
 * Loading skeleton for player table rows
 */

export function SkeletonRow({ delay = 0 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "56px 1fr 100px 120px 130px",
      padding: "13px 20px",
      borderBottom: "1px solid rgba(250,164,26,0.07)",
      animation: `skPulse 1.4s ease-in-out ${delay}s infinite`,
      gap: 8,
      alignItems: "center",
    }}>
      {[40, 200, 60, 80, 90].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 4,
            background: "rgba(250,164,26,0.1)",
            width: w,
            margin: i === 0 ? 0 : "0 auto",
          }}
        />
      ))}
    </div>
  );
}
