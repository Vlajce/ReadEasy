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
    <div
      style={{
        padding: "24px",
      }}
    >
      {/* Metric Cards */}
      <div style={{ marginBottom: "24px" }}>
        <MetricCards overview={data.overview} />
      </div>

      {/* Sekcija 1: Activity & Progression Charts */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "16px",
          }}
        >
          <DailyActivityChart
            activity={data.activity.activity}
            days={days}
            setDays={setDays}
          />
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
