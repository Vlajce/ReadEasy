import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizTriggerButtonProps {
  onClick: () => void;
}

export function QuizTriggerButton({ onClick }: QuizTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 rounded-full px-4 py-2.5",
        "bg-primary text-primary-foreground shadow-lg",
        "hover:shadow-xl hover:scale-105 active:scale-100",
        "transition-all duration-200",
        "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
      )}
      aria-label="Open quick quiz"
    >
      {/* Pulsing dot */}
      <span className="relative flex size-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-60" />
        <span className="relative inline-flex rounded-full size-2 bg-primary-foreground" />
      </span>
      <span className="text-sm font-medium">Quiz?</span>
      <BookOpen className="size-4 opacity-80" />
    </button>
  );
}
