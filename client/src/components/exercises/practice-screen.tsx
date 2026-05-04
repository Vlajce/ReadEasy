import { useState, useRef } from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FillBlankExercise } from "./fill-blank-exercise";
import { MultipleChoiceExercise } from "./multiple-choice-exercise";
import { useSubmitExercises } from "@/mutations/use-submit-exercises";
import type { Exercise, SessionResult } from "@/types/exercise";

interface PracticeScreenProps {
  exercises: Exercise[];
  onFinish: (results: SessionResult[]) => void;
  onExit: () => void;
}

const getShuffledOptions = (exercise: Exercise): string[] => {
  if (
    exercise.type === "multiple_choice_translation" ||
    exercise.type === "multiple_choice_fill_blank"
  ) {
    return [...exercise.options].sort(() => Math.random() - 0.5);
  }
  return [];
};

export function PracticeScreen({
  exercises,
  onFinish,
  onExit,
}: PracticeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<SessionResult[]>([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(
    null,
  );
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(() =>
    getShuffledOptions(exercises[0]!),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: submitExercises } = useSubmitExercises();

  const current = exercises[currentIndex]!;
  const isLast = currentIndex === exercises.length - 1;
  const isMultipleChoice =
    current.type === "multiple_choice_translation" ||
    current.type === "multiple_choice_fill_blank";

  const handleCheck = () => {
    if (feedback !== null) return;

    const answer = isMultipleChoice
      ? (selectedOption ?? "")
      : userAnswer.trim();
    const correct = answer.toLowerCase() === current.answer.toLowerCase();

    setFeedback(correct ? "correct" : "incorrect");
    setSessionResults((prev) => [
      ...prev,
      { exercise: current, userAnswer: answer, correct },
    ]);
  };

  const handleNext = () => {
    if (isLast) {
      submitExercises({
        results: sessionResults.map((r) => ({
          entryId: r.exercise.entryId,
          correct: r.correct,
        })),
      });
      onFinish(sessionResults);
    } else {
      const nextIndex = currentIndex + 1;
      const nextExercise = exercises[nextIndex]!;
      setCurrentIndex(nextIndex);
      setUserAnswer("");
      setSelectedOption(null);
      setFeedback(null);
      setShuffledOptions(getShuffledOptions(nextExercise));
    }
  };

  const canCheck = isMultipleChoice
    ? selectedOption !== null
    : userAnswer.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Question {currentIndex + 1} of {exercises.length}
        </p>
        <Button variant="ghost" size="icon" onClick={onExit}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full bg-foreground transition-all duration-300"
          style={{
            width: `${((currentIndex + (feedback ? 1 : 0)) / exercises.length) * 100}%`,
          }}
        />
      </div>

      {/* Exercise */}
      <div className="flex flex-col gap-6 pt-4">
        {current.type === "fill_blank" && (
          <FillBlankExercise
            sentence={current.sentence}
            answer={current.answer}
            value={userAnswer}
            onChange={setUserAnswer}
            feedback={feedback}
            inputRef={inputRef}
            onSubmit={feedback ? handleNext : handleCheck}
          />
        )}
        {current.type === "multiple_choice_translation" && (
          <MultipleChoiceExercise
            label={current.word}
            labelPrefix="Translate:"
            options={shuffledOptions}
            selected={selectedOption}
            onSelect={setSelectedOption}
            feedback={feedback}
            answer={current.answer}
          />
        )}
        {current.type === "multiple_choice_fill_blank" && (
          <MultipleChoiceExercise
            label={current.sentence}
            isSentence
            options={shuffledOptions}
            selected={selectedOption}
            onSelect={setSelectedOption}
            feedback={feedback}
            answer={current.answer}
          />
        )}
      </div>

      {/* Feedback + Action */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-medium">
          {feedback === "correct" && (
            <span className="flex items-center gap-1.5 text-green-600">
              <Check className="size-4" /> Correct! Great job.
            </span>
          )}
          {feedback === "incorrect" && (
            <span className="flex items-center gap-1.5 text-destructive">
              <X className="size-4" /> Incorrect.
            </span>
          )}
        </div>

        {feedback === null ? (
          <Button onClick={handleCheck} disabled={!canCheck}>
            Check <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {isLast ? "Finish" : "Next"} <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
