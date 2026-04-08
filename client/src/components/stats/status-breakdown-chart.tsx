import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { VocabularyStatus } from "@/types/vocabulary";

interface StatusBreakdownChartProps {
  byStatus: Record<VocabularyStatus, number>;
}

const COLORS = {
  new: "#378ADD",
  learning: "#EF9F27",
  mastered: "#1D9E75",
};

const LABELS = {
  new: "New",
  learning: "Learning",
  mastered: "Mastered",
};

export function StatusBreakdownChart({ byStatus }: StatusBreakdownChartProps) {
  const data = [
    { name: "New", value: byStatus.new },
    { name: "Learning", value: byStatus.learning },
    { name: "Mastered", value: byStatus.mastered },
  ];

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
        Status breakdown
      </div>

      <div
        style={{
          position: "relative",
          height: "130px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={COLORS.new} />
              <Cell fill={COLORS.learning} />
              <Cell fill={COLORS.mastered} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "12px",
        }}
      >
        {(["new", "learning", "mastered"] as const).map((status) => (
          <span
            key={status}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: COLORS[status],
                display: "inline-block",
              }}
            />
            {LABELS[status]} {byStatus[status]}
          </span>
        ))}
      </div>
    </div>
  );
}
