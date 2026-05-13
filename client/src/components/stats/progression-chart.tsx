import type { ProgressionStats } from "@/types/vocabulary";

interface ProgressionChartProps {
  progression: ProgressionStats;
  days: 7 | 30;
}

export function ProgressionChart({ progression, days }: ProgressionChartProps) {
  const { newToLearning, learningToMastered, accuracyRate } = progression;
  const maxProgression = Math.max(newToLearning, learningToMastered, 1);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          marginBottom: "16px",
        }}
      >
        Your progress{" "}
        <span
          style={{
            fontSize: "12px",
            color: "var(--color-text-secondary)",
            fontWeight: 400,
          }}
        >
          last {days}d
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* New → Learning */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              new → learning
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {newToLearning}
            </span>
          </div>
          <div
            style={{
              height: "6px",
              backgroundColor: "var(--color-background-secondary)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(newToLearning / maxProgression) * 100}%`,
                backgroundColor: "#EF9F27",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Learning → Mastered */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              learning → mastered
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {learningToMastered}
            </span>
          </div>
          <div
            style={{
              height: "6px",
              backgroundColor: "var(--color-background-secondary)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(learningToMastered / maxProgression) * 100}%`,
                backgroundColor: "#1D9E75",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: "0.5px solid var(--color-border-tertiary)",
            paddingTop: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
            >
              Accuracy rate
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {accuracyRate}%
            </span>
          </div>
          <div
            style={{
              height: "6px",
              backgroundColor: "var(--color-background-secondary)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${accuracyRate}%`,
                backgroundColor: "#378ADD",
                borderRadius: "3px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
