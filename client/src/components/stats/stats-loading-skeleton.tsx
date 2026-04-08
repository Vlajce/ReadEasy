import { Loader2 } from "lucide-react";

export function StatsLoadingSkeleton() {
  return (
    <div
      style={{
        padding: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Loader2
          size={48}
          style={{
            animation: "spin 1s linear infinite",
            marginBottom: "16px",
            margin: "0 auto 16px",
            color: "var(--color-text-secondary)",
          }}
        />
        <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>
          Loading your progress...
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
