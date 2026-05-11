import { useState, useCallback } from "react";
import { BookOpen, ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSubmitQuiz } from "@/mutations/use-submit-quiz";
import { useSaveVocabulary } from "@/mutations/use-save-vocabulary";
import type { BookQuizDTO } from "@/types/vocabulary";
import type { SubmitQuizInput } from "@/schemas/vocabulary";

interface QuizCardProps {
  quiz: BookQuizDTO;
  isLoading?: boolean;
  onClose: () => void;
  onDone: () => void;
}

export function QuizCard({
  quiz,
  isLoading = false,
  onClose,
  onDone,
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const { mutate: submitQuiz, isPending: isSubmitting } = useSubmitQuiz();
  const { mutate: saveVocabulary, isPending: isSaving } = useSaveVocabulary();

  const handleAnswer = useCallback(
    (option: string) => {
      if (selectedOption || isSubmitting) return;

      const correct = option === quiz.correctAnswer;
      setSelectedOption(option);
      setIsCorrect(correct);

      const payload: SubmitQuizInput = {
        bookId: quiz.bookId,
        word: quiz.word,
        baseForm: quiz.baseForm,
        translation: quiz.correctAnswer,
        partOfSpeech: quiz.partOfSpeech,
        language: quiz.language,
        exampleSentence: quiz.exampleSentence,
        correct,
      };

      // Samo dodaj entryId ako postoji
      if (quiz.entryId) {
        payload.entryId = quiz.entryId;
      }

      console.log("📤 Sending quiz submit payload:", payload);

      submitQuiz(payload, {
        onSuccess: (response) => {
          console.log("✅ Quiz submit response:", response);
        },
        onError: (error) => {
          console.error("❌ Quiz submit error:", error);
        },
      });
    },
    [quiz, selectedOption, isSubmitting, submitQuiz],
  );

  // ── Skip quiz ───────────────────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    onClose();
    onDone();
  }, [onClose, onDone]);

  const handleContinueReading = useCallback(() => {
    onClose();
    onDone();
  }, [onClose, onDone]);

  const handleSave = useCallback(() => {
    saveVocabulary(
      {
        word: quiz.word,
        bookId: quiz.bookId,
        sentence: quiz.exampleSentence,
        translation: quiz.correctAnswer,
        baseForm: quiz.baseForm,
        partOfSpeech: quiz.partOfSpeech,
        exampleSentence: quiz.exampleSentence,
      },
      {
        onSuccess: () => {
          onClose();
          onDone();
        },
        onError: () => {
          toast.error("Failed to save word. Please try again.");
        },
      },
    );
  }, [quiz, saveVocabulary, onClose, onDone]);

  return (
    <div
      className={cn(
        "w-80 rounded-2xl border bg-background shadow-2xl",
        "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
        "ring-1 ring-foreground/5",
      )}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BookOpen className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Quick Quiz
          </span>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Minimize quiz"
        >
          <ChevronDown className="size-4" />
        </Button>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {isLoading ? (
          <QuizSkeleton />
        ) : (
          <QuestionPhase
            quiz={quiz}
            selectedOption={selectedOption}
            onAnswer={handleAnswer}
            onSkip={handleSkip}
            isSubmitting={isSubmitting}
            isCorrect={isCorrect}
            onContinueReading={handleContinueReading}
            onAddToVocabulary={handleSave}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuizSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2 text-center">
        <div className="h-3 w-48 mx-auto bg-muted rounded" />
        <div className="h-7 w-36 mx-auto bg-muted rounded" />
        <div className="h-3 w-16 mx-auto bg-muted rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

interface QuestionPhaseProps {
  quiz: BookQuizDTO;
  selectedOption: string | null;
  onAnswer: (option: string) => void;
  onSkip: () => void;
  isSubmitting: boolean;
  isCorrect: boolean | null;
  onContinueReading: () => void;
  onAddToVocabulary: () => void;
  isSaving: boolean;
}

function QuestionPhase({
  quiz,
  selectedOption,
  onAnswer,
  onSkip,
  isSubmitting,
  isCorrect,
  onContinueReading,
  onAddToVocabulary,
  isSaving,
}: QuestionPhaseProps) {
  const showResult = selectedOption !== null && isCorrect !== null;
  const canAddToVocabulary = !quiz.alreadyInVocabulary;

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          Many readers don't know this word. Do you?
        </p>
        <p className="text-2xl font-bold italic">"{quiz.word}"</p>
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {quiz.language}
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {quiz.options.map((option) => {
          const isSelected = selectedOption === option;
          const isOptionCorrect = option === quiz.correctAnswer;

          return (
            <button
              key={option}
              type="button"
              disabled={!!selectedOption || isSubmitting}
              onClick={() => onAnswer(option)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium text-center transition-all duration-200",
                "hover:border-primary/50 hover:bg-accent",
                "disabled:cursor-not-allowed",
                // Default state
                !showResult && "border-border bg-background",
                // After answering
                showResult &&
                  isOptionCorrect &&
                  "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
                showResult &&
                  isSelected &&
                  !isOptionCorrect &&
                  "border-destructive bg-destructive/5 text-destructive",
                showResult &&
                  !isSelected &&
                  !isOptionCorrect &&
                  "border-border opacity-40",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Skip */}
      {!selectedOption && (
        <Button size="sm" className="w-full" onClick={onSkip}>
          Skip
        </Button>
      )}

      {showResult && (
        <div className="space-y-3 pt-1">
          <div
            className={cn(
              "flex items-center gap-2 font-semibold",
              isCorrect
                ? "text-green-600 dark:text-green-400"
                : "text-destructive",
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
            <span>{isCorrect ? "Correct!" : "Not quite"}</span>
          </div>

          <div className="rounded-xl bg-muted/50 px-3 py-2.5 space-y-1">
            <p className="text-xs text-muted-foreground">Correct answer</p>
            <p className="text-sm font-semibold">
              {quiz.word} = {quiz.correctAnswer}
            </p>
            {quiz.exampleSentence && (
              <p className="text-xs text-muted-foreground italic mt-1">
                "{quiz.exampleSentence}"
              </p>
            )}
          </div>

          <div className="space-y-2">
            {canAddToVocabulary ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Add this word to your vocabulary?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    onClick={onAddToVocabulary}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Add to vocabulary"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={onContinueReading}>
                    No thanks
                  </Button>
                </div>
              </>
            ) : (
              <Button size="sm" className="w-full" onClick={onContinueReading}>
                Continue reading
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
