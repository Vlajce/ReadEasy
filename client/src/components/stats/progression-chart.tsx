import type { ProgressionStats } from "@/types/vocabulary";

interface ProgressionChartProps {
  progression: ProgressionStats;
  days: 7 | 30;
}

interface BarRowProps {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  color: string;
  isPercentage?: boolean;
}

function BarRow({
  label,
  sublabel,
  value,
  max,
  color,
  isPercentage = false,
}: BarRowProps) {
  const pct = isPercentage ? value : (value / max) * 100;
  const displayValue = isPercentage ? `${value}%` : value;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "7px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary, #888)",
            }}
          >
            {label}
          </span>
          {sublabel && (
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-text-secondary, #aaa)",
                opacity: 0.7,
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-text-primary, #111)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayValue}
        </span>
      </div>

      <div
        style={{
          height: "5px",
          backgroundColor: "var(--color-background-primary, #efefef)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(pct, 100)}%`,
            backgroundColor: color,
            borderRadius: "99px",
            transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}

export function ProgressionChart({ progression }: ProgressionChartProps) {
  const { newToLearning, learningToMastered, accuracyRate } = progression;
  const maxProgression = Math.max(newToLearning, learningToMastered, 1);

  return (
    <div
      style={{
        backgroundColor: "var(--color-background-secondary, #f9f9f9)",
        border: "0.5px solid var(--color-border-tertiary, #ebebeb)",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: "18px",
        }}
      >
        Learning momentum
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <BarRow
          label="New → Learning"
          value={newToLearning}
          max={maxProgression}
          color="#EF9F27"
        />
        <BarRow
          label="Learning → Mastered"
          value={learningToMastered}
          max={maxProgression}
          color="#1D9E75"
        />
      </div>

      <div
        style={{
          borderTop: "0.5px solid var(--color-border-tertiary, #e8e8e8)",
          margin: "16px 0",
        }}
      />

      <BarRow
        label="Accuracy rate"
        value={accuracyRate}
        max={100}
        color="#378ADD"
        isPercentage
      />
      <p
        style={{
          margin: "8px 0 0 0",
          fontSize: "11px",
          color: "var(--color-text-secondary, #aaa)",
          lineHeight: 1.5,
        }}
      >
        Overall correct answer rate across all your quiz history.
      </p>
    </div>
  );
}
