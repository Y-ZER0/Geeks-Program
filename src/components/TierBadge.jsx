import { getTier } from "../utils/tiers";

export default function TierBadge({ pts }) {
  const t = getTier(pts);
  return (
    <span style={{
      display: "inline-block", whiteSpace: "nowrap",
      fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
      padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase",
      color: t.color, background: t.bg, border: `1px solid ${t.color}66`,
    }}>
      {t.name}
    </span>
  );
}
