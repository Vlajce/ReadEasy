import type { StatsResponse } from "@/types/vocabulary";
import { MetricCards } from "./metric-cards";
import { DailyActivityChart } from "./daily-activity-chart.tsx";
import { StatusBreakdownChart } from "./status-breakdown-chart";
import { LanguageBreakdownSection } from "./language-breakdown-section";

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
          marginBottom: "20px",
        }}
      >
        {/* Activity Chart */}
        <DailyActivityChart
          activity={data.activity.activity}
          days={days}
          setDays={setDays}
        />

        {/* Status Breakdown */}
        <StatusBreakdownChart byStatus={data.overview.byStatus} />
      </div>

      {/* Language Breakdown */}
      <LanguageBreakdownSection languages={data.byLanguage.languages} />
    </div>
  );
}
