import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SetupDialog } from "@/components/exercises/setup-dialog";
import { PracticeScreen } from "@/components/exercises/practice-screen";
import { ResultsScreen } from "@/components/exercises/results-screen";
import { getVocabularyStatsQueryOptions } from "@/query-options/get-vocabulary-stats-query-options";
import type { Exercise, SessionResult } from "@/types/exercise";

export const Route = createFileRoute("/_protected/exercises")({
  staticData: { title: "Exercises" },
  component: ExercisesPage,
});

type PageState = "setup" | "practice" | "results";

function ExercisesPage() {
  const [pageState, setPageState] = useState<PageState>("setup");
  const [setupOpen, setSetupOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [results, setResults] = useState<SessionResult[]>([]);

  const statsQuery = useQuery(getVocabularyStatsQueryOptions());
  const availableLanguages = statsQuery.data?.byLanguage?.languages ?? [];

  const handleStart = (generated: Exercise[]) => {
    setExercises(generated);
    setResults([]);
    setPageState("practice");
    setSetupOpen(false);
  };

  const handleFinish = (sessionResults: SessionResult[]) => {
    setResults(sessionResults);
    setPageState("results");
  };

  const handleReset = () => {
    setExercises([]);
    setResults([]);
    setPageState("setup");
  };

  if (pageState === "practice") {
    return (
      <PracticeScreen
        exercises={exercises}
        onFinish={handleFinish}
        onExit={handleReset}
      />
    );
  }

  if (pageState === "results") {
    return <ResultsScreen results={results} onFinish={handleReset} />;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-lg mx-auto gap-6">
        <div className="p-4 bg-muted rounded-full">
          <GraduationCap className="w-8 h-8 text-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Practice your vocabulary
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Test your knowledge with personalized exercises designed to help you
            retain new words from your library.
          </p>
        </div>
        <Button size="lg" onClick={() => setSetupOpen(true)} className="px-8">
          Start Practice
        </Button>
      </div>

      <SetupDialog
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onStart={handleStart}
        availableLanguages={availableLanguages}
      />
    </>
  );
}
