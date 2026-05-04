import { useState, useEffect, useRef } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useGenerateExercises } from "@/mutations/use-generate-exercises";
import { getName, getEmoji, getLanguage } from "language-flag-colors";
import type { Exercise, ExerciseMode, ExerciseType } from "@/types/exercise";
import type { LanguageStatsItem } from "@/types/vocabulary";

const MODES: { id: ExerciseMode; label: string; desc: string }[] = [
  {
    id: "smart_mix",
    label: "Smart Mix",
    desc: "Recommended balance of new and learning words.",
  },
  {
    id: "new_only",
    label: "New Words",
    desc: "Focus only on words you just saved.",
  },
  {
    id: "learning_only",
    label: "Learning Words",
    desc: "Strengthen words you are currently practicing.",
  },
  {
    id: "all",
    label: "All Words",
    desc: "Review your entire vocabulary list.",
  },
];

const COUNT_OPTIONS = [5, 10, 20] as const;

const TYPE_OPTIONS: { id: ExerciseType; label: string }[] = [
  { id: "fill_blank", label: "Fill in the blank" },
  { id: "multiple_choice_translation", label: "Multiple choice translation" },
  { id: "multiple_choice_fill_blank", label: "Multiple choice fill blank" },
];

const LOADING_MESSAGES = [
  "Analyzing your vocabulary...",
  "Crafting your exercises...",
  "Almost ready...",
];

function formatLanguage(language: string) {
  const country = getLanguage(language)?.country ?? "";
  const emoji = country ? getEmoji(country) : "";
  const name = getName(language) || language.toUpperCase();
  return `${emoji ? `${emoji} ` : ""}${name}`;
}

interface SetupDialogProps {
  open: boolean;
  onClose: () => void;
  onStart: (exercises: Exercise[]) => void;
  availableLanguages: LanguageStatsItem[];
}

export function SetupDialog({
  open,
  onClose,
  onStart,
  availableLanguages,
}: SetupDialogProps) {
  const [language, setLanguage] = useState<string>("");
  const [mode, setMode] = useState<ExerciseMode>("smart_mix");
  const [count, setCount] = useState<number>(10);
  const [types, setTypes] = useState<ExerciseType[]>([
    "fill_blank",
    "multiple_choice_translation",
    "multiple_choice_fill_blank",
  ]);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]!);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIndexRef = useRef(0);

  const { mutate: generate, isPending } = useGenerateExercises();

  const effectiveLanguage = language || availableLanguages[0]?.language || "";

  useEffect(() => {
    if (!isPending) return;

    msgIndexRef.current = 0;

    intervalRef.current = setInterval(() => {
      msgIndexRef.current = Math.min(
        msgIndexRef.current + 1,
        LOADING_MESSAGES.length - 1,
      );
      setLoadingMessage(LOADING_MESSAGES[msgIndexRef.current]!);
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPending]);

  const toggleType = (type: ExerciseType) => {
    setTypes((prev) =>
      prev.includes(type)
        ? prev.length === 1
          ? prev
          : prev.filter((t) => t !== type)
        : [...prev, type],
    );
  };

  const handleStart = () => {
    if (!effectiveLanguage) return;
    generate(
      { language: effectiveLanguage, count, types, mode },
      { onSuccess: (data) => onStart(data) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md flex flex-col max-h-[90vh] p-0 gap-0"
      >
        {/* Sticky header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <DialogTitle>Exercise Setup</DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col gap-5 px-6 py-4 overflow-y-auto flex-1">
          {/* Language */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Language
            </p>
            {availableLanguages.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                No vocabulary words yet.
              </p>
            ) : (
              <Select value={effectiveLanguage} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((l) => (
                    <SelectItem key={l.language} value={l.language}>
                      {formatLanguage(l.language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Practice Mode */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Practice Mode
            </p>
            <div className="flex flex-col gap-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  disabled={isPending}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    mode === m.id
                      ? "border-foreground bg-accent"
                      : "border-border hover:bg-muted/50",
                    isPending && "opacity-50 pointer-events-none",
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                      mode === m.id
                        ? "border-foreground"
                        : "border-muted-foreground",
                    )}
                  >
                    {mode === m.id && (
                      <div className="size-2 rounded-full bg-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Exercise Types */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Exercise Types
            </p>
            <div className="flex flex-col gap-2">
              {TYPE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  disabled={isPending}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                    types.includes(t.id)
                      ? "border-foreground bg-accent"
                      : "border-border hover:bg-muted/50",
                    isPending && "opacity-50 pointer-events-none",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border-2",
                      types.includes(t.id)
                        ? "border-foreground bg-foreground"
                        : "border-muted-foreground",
                    )}
                  >
                    {types.includes(t.id) && (
                      <Check className="size-3 text-background" />
                    )}
                  </div>
                  <p className="text-sm font-medium">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Words to Practice
            </p>
            <div className="flex gap-2">
              {COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  disabled={isPending}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                    count === n
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:bg-muted/50",
                    isPending && "opacity-50 pointer-events-none",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="px-6 py-4 border-t shrink-0">
          {isPending ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={handleStart}
              disabled={!effectiveLanguage || availableLanguages.length === 0}
            >
              Start Practice
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
