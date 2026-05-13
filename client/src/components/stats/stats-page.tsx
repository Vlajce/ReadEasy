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
    <div style={{ padding: "10px" }}>
      {/* Metric Cards */}
      <MetricCards overview={data.overview} />

      {/* Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <DailyActivityChart
          activity={data.activity.activity}
          days={days}
          setDays={setDays}
        />
        <ProgressionChart progression={data.progression} days={days} />
      </div>

      {/* Charts Grid - Row 2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <LanguageBreakdownSection languages={data.byLanguage.languages} />
        <StatusBreakdownChart byStatus={data.overview.byStatus} />
      </div>
    </div>
  );
}
