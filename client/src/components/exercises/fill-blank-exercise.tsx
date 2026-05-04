import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FillBlankExerciseProps {
  sentence: string;
  answer: string;
  value: string;
  onChange: (v: string) => void;
  feedback: "correct" | "incorrect" | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
}

export function FillBlankExercise({
  sentence,
  answer,
  value,
  onChange,
  feedback,
  inputRef,
  onSubmit,
}: FillBlankExerciseProps) {
  const parts = sentence.split("_____");

  return (
    <div className="flex flex-col gap-4">
      <p className="text-2xl font-medium leading-relaxed">
        {parts[0]}
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={feedback !== null}
          className={cn(
            "inline-flex w-36 mx-2 h-9 text-base align-baseline",
            feedback === "correct" && "border-green-500 text-green-600",
            feedback === "incorrect" && "border-destructive text-destructive",
          )}
        />
        {parts[1]}
      </p>
      {feedback === "incorrect" && (
        <p className="text-sm text-muted-foreground">
          Correct answer:{" "}
          <span className="font-medium text-foreground">{answer}</span>
        </p>
      )}
    </div>
  );
}
