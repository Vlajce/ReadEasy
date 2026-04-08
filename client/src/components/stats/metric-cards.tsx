import type { OverviewStats } from "@/types/vocabulary";

interface MetricCardsProps {
  overview: OverviewStats;
}

export function MetricCards({ overview }: MetricCardsProps) {
  const totalWords =
    overview.byStatus.new +
    overview.byStatus.learning +
    overview.byStatus.mastered;

  const metrics = [
    {
      label: "Total words",
      value: totalWords,
      subtitle: "across all books",
    },
    {
      label: "This week",
      value: overview.wordsAdded.thisWeek,
      subtitle: "new words saved",
    },
    {
      label: "Reviewed",
      value: overview.byStatus.learning + overview.byStatus.mastered,
      subtitle: "practiced at least once",
    },
    {
      label: "Mastered",
      value: overview.byStatus.mastered,
      subtitle: "fully learned words",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "12px",
        marginBottom: "24px",
      }}
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          style={{
            backgroundColor: "var(--color-background-secondary)",
            borderRadius: "8px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              marginBottom: "6px",
            }}
          >
            {metric.label}
          </div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            {metric.value}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              marginTop: "4px",
            }}
          >
            {metric.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}
