import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { BookMarked } from "lucide-react";
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
  const total = byStatus.new + byStatus.learning + byStatus.mastered;

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div className="bg-zinc-50 rounded-xl">
          <BookMarked className="w-5 h-5 text-zinc-900" />
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
          }}
        >
          Status
        </div>
      </div>

      {/* Donut chart with total in center */}
      <div
        style={{
          position: "relative",
          height: "160px",
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
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={COLORS.new} />
              <Cell fill={COLORS.learning} />
              <Cell fill={COLORS.mastered} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Total in center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              lineHeight: 1,
            }}
          >
            {total}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--color-text-secondary)",
              letterSpacing: "0.08em",
              marginTop: "4px",
            }}
          >
            TOTAL
          </div>
        </div>
      </div>

      {/* Legend */}
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
                flexShrink: 0,
              }}
            />
            {LABELS[status]}{" "}
            <span
              style={{ color: "var(--color-text-primary)", fontWeight: 500 }}
            >
              {byStatus[status]}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
