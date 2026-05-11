import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBookQuizQueryOptions } from "@/query-options/get-book-quiz-query-options";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizTriggerButton } from "@/components/quiz/QuizTriggerButton";

interface PopupQuizProps {
  bookId: string;
  onDone: () => void;
}

export function PopupQuiz({ bookId, onDone }: PopupQuizProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch only when opening a new quiz session.
  const { data: quiz, isFetching } = useQuery({
    ...getBookQuizQueryOptions(bookId),
    enabled: isOpen,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // ── Open quiz ──────────────────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  // ── Minimize quiz ──────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ── Quiz done ──────────────────────────────────────────────────────────────
  const handleDone = useCallback(() => {
    setIsOpen(false);
    queryClient.removeQueries({
      queryKey: ["vocabulary", "books", bookId, "quiz"],
    });
    onDone();
  }, [bookId, onDone, queryClient]);

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3">
      {/* Quiz Card */}
      {isOpen && quiz && (
        <QuizCard
          quiz={quiz}
          isLoading={isFetching}
          onClose={handleClose}
          onDone={handleDone}
        />
      )}

      {/* Trigger Button */}
      {!isOpen && <QuizTriggerButton onClick={handleOpen} />}
    </div>
  );
}
