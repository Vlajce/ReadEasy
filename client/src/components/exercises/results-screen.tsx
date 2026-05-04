import { BarChart3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionResult } from "@/types/exercise";

interface ResultsScreenProps {
  results: SessionResult[];
  onFinish: () => void;
}

export function ResultsScreen({ results, onFinish }: ResultsScreenProps) {
  const correct = results.filter((r) => r.correct).length;
  const mistakes = results.filter((r) => !r.correct);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md flex flex-col gap-6 rounded-2xl border bg-card p-8">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-green-100">
            <BarChart3 className="size-8 text-green-600" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold">Practice Complete!</h2>
          <p className="mt-2">
            <span className="text-5xl font-bold">{correct}</span>
            <span className="text-xl text-muted-foreground">
              {" "}
              / {results.length} correct
            </span>
          </p>
        </div>

        {mistakes.length > 0 && (
          <div className="rounded-xl bg-muted/50 p-4 flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Review Mistakes
            </p>
            <div className="flex flex-col gap-2">
              {mistakes.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-destructive line-through">
                    {r.userAnswer || "—"}
                  </span>
                  <ArrowRight className="size-3 text-muted-foreground mx-2 shrink-0" />
                  <span className="text-green-600 font-medium">
                    {r.exercise.answer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button className="w-full" onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  );
}
