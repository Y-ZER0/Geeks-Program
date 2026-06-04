import { getTier, getProgress } from "../utils/tiers";
import { fmt } from "../utils/formatters";

export default function ProgressBar({ pts }) {
  const tier = getTier(pts);
  const prog = getProgress(pts);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
      <div style={{
        flex: 1, height: 6, background: "rgba(255,255,255,0.08)",
        borderRadius: 3, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 3,
          width: `${prog.pct}%`,
          background: `linear-gradient(90deg,${tier.color},${prog.next !== "MAX" ? getTier(pts + prog.rem + 1).color : tier.color})`,
          transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
      {prog.next !== "MAX" ? (
        <span style={{ fontSize: 9, color: "#9a8070", whiteSpace: "nowrap" }}>
          {fmt(pts)} / {prog.rem > 0 ? fmt(pts + prog.rem) : "—"}
        </span>
      ) : (
        <span style={{ fontSize: 9, color: "#FFD883", whiteSpace: "nowrap" }}>★ MAX</span>
      )}
    </div>
  );
}
