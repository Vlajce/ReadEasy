import type { StatsResponse } from "@/types/vocabulary";
import { MetricCards } from "./metric-cards";
import { DailyActivityChart } from "./daily-activity-chart.tsx";
import { StatusBreakdownChart } from "./status-breakdown-chart";
import { LanguageBreakdownSection } from "./language-breakdown-section";
import { ProgressionChart } from "./progression-chart";

export interface StatsPageProps {
  data: StatsResponse;
  days: 7 | 30;
  setDays: (days: 7 | 30) => void;
}

export function StatsPage({ data, days, setDays }: StatsPageProps) {
  return (
    <div style={{ padding: "24px" }}>
      {/* Metric Cards */}
      <div style={{ marginBottom: "24px" }}>
        <MetricCards overview={data.overview} />
      </div>

      {/* Sekcija 1: Activity & Progression — zajednički wrapper sa shared toggleom */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Header sekcije sa toggleom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Activity & Progress
          </span>

          {/* Shared day toggle */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              backgroundColor: "var(--color-background-secondary, #f5f5f5)",
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            {([7, 30] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: days === d ? "#ffffff" : "transparent",
                  color:
                    days === d
                      ? "var(--color-text-primary, #111)"
                      : "var(--color-text-secondary, #888)",
                  cursor: "pointer",
                  boxShadow: days === d ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Dve kartice jedna pored druge */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "12px",
          }}
        >
          <DailyActivityChart activity={data.activity.activity} days={days} />
          <ProgressionChart progression={data.progression} days={days} />
        </div>
      </div>

      {/* Sekcija 2: Language & Status */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <LanguageBreakdownSection languages={data.byLanguage.languages} />
        </div>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
          }}
        >
          <StatusBreakdownChart byStatus={data.overview.byStatus} />
        </div>
      </div>
    </div>
  );
}
