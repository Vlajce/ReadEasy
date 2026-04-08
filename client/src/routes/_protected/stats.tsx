import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getVocabularyStatsQueryOptions } from "@/query-options/get-vocabulary-stats-query-options";
import { StatsPage } from "@/components/stats/stats-page";
import { StatsLoadingSkeleton } from "@/components/stats/stats-loading-skeleton";
import { StatsEmpty } from "@/components/stats/stats-empty";

export const Route = createFileRoute("/_protected/stats")({
  staticData: {
    title: "Progress",
  },
  component: StatsPageComponent,
});

function StatsPageComponent() {
  const [days, setDays] = useState<7 | 30>(7);
  const statsQuery = useQuery(getVocabularyStatsQueryOptions(days));

  if (statsQuery.isPending) {
    return <StatsLoadingSkeleton />;
  }

  if (!statsQuery.data) {
    return <StatsEmpty />;
  }

  const data = statsQuery.data;
  const totalWords =
    (data.overview.byStatus.new ?? 0) +
    (data.overview.byStatus.learning ?? 0) +
    (data.overview.byStatus.mastered ?? 0);

  // Show empty state if no words
  if (totalWords === 0) {
    return <StatsEmpty />;
  }

  return (
    <StatsPage
      data={data}
      days={days}
      setDays={setDays}
    />
  );
}
