import { AlertTriangle } from "lucide-react";

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "rgba(231,76,60,0.12)", border: "1px solid rgba(231,76,60,0.4)",
      borderRadius: 8, padding: "10px 14px", marginBottom: 16,
      fontSize: 12, color: "#F5E6D3",
    }}>
      <AlertTriangle size={15} color="#E74C3C" />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          marginLeft: "auto", fontSize: 11, padding: "4px 10px", borderRadius: 6,
          background: "rgba(231,76,60,0.2)", color: "#F5E6D3", border: "1px solid rgba(231,76,60,0.5)",
          cursor: "pointer", fontFamily: "'Montserrat',sans-serif",
        }}>
          Retry
        </button>
      )}
    </div>
  );
}
