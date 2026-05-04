import { cn } from "@/lib/utils";

interface MultipleChoiceExerciseProps {
  label: string;
  labelPrefix?: string;
  isSentence?: boolean;
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  feedback: "correct" | "incorrect" | null;
  answer: string;
}

export function MultipleChoiceExercise({
  label,
  labelPrefix,
  isSentence = false,
  options,
  selected,
  onSelect,
  feedback,
  answer,
}: MultipleChoiceExerciseProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        {labelPrefix && (
          <p className="text-sm text-muted-foreground mb-1">{labelPrefix}</p>
        )}
        <p
          className={cn(
            isSentence
              ? "text-xl font-medium leading-relaxed"
              : "text-3xl font-semibold",
          )}
        >
          {label}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = option === answer;
          const showCorrect = feedback !== null && isCorrect;
          const showWrong = feedback !== null && isSelected && !isCorrect;

          return (
            <button
              key={option}
              type="button"
              disabled={feedback !== null}
              onClick={() => onSelect(option)}
              className={cn(
                "rounded-xl border p-4 text-sm font-medium text-left transition-colors",
                !feedback && !isSelected && "border-border hover:bg-muted/50",
                !feedback &&
                  isSelected &&
                  "border-foreground bg-foreground text-background",
                showCorrect && "border-green-500 bg-green-50 text-green-700",
                showWrong &&
                  "border-destructive bg-destructive/10 text-destructive",
                feedback !== null && !isSelected && !isCorrect && "opacity-50",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
