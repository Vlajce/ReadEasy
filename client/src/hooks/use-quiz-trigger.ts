import { useCallback, useEffect, useRef, useState } from "react";

const MIN_PARAGRAPHS_SCROLLED = 10;
const MIN_MINUTES_BETWEEN_QUIZZES = 0.1;
const MAX_QUIZZES_PER_SESSION = 3;
const ACTIVITY_TIMEOUT_MS = 60_000; // 60 seconds

interface UseQuizTriggerOptions {
  /** ref of the book content container */
  contentRef: React.RefObject<HTMLElement | null>;
  /** Whether user currently has text selected (don't show quiz) */
  isTextSelected: boolean;
  /** Callback when all conditions are met */
  onTrigger: () => void;
}

export function useQuizTrigger({
  contentRef,
  isTextSelected,
  onTrigger,
}: UseQuizTriggerOptions) {
  const [quizCount, setQuizCount] = useState(0);

  const lastQuizTimeRef = useRef<number>(0);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const paragraphsScrolledRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(window.scrollY);
  const hasTriggeredRef = useRef<boolean>(false);
  const isTextSelectedRef = useRef(isTextSelected);

  // Keep ref in sync so scroll handler always has the latest value
  useEffect(() => {
    isTextSelectedRef.current = isTextSelected;
  }, [isTextSelected]);

  const recordActivity = useCallback(() => {
    lastActivityTimeRef.current = Date.now();
  }, []);

  const checkAndTrigger = useCallback(() => {
    if (hasTriggeredRef.current) return;
    if (quizCount >= MAX_QUIZZES_PER_SESSION) return;
    if (isTextSelectedRef.current) return;

    const now = Date.now();
    const minutesSinceLastQuiz = (now - lastQuizTimeRef.current) / 1000 / 60;
    const secondsSinceActivity = (now - lastActivityTimeRef.current) / 1000;

    const isActive = secondsSinceActivity < ACTIVITY_TIMEOUT_MS / 1000;
    const enoughTimePassed =
      lastQuizTimeRef.current === 0 ||
      minutesSinceLastQuiz >= MIN_MINUTES_BETWEEN_QUIZZES;
    const enoughScrolled =
      paragraphsScrolledRef.current >= MIN_PARAGRAPHS_SCROLLED;

    if (isActive && enoughTimePassed && enoughScrolled) {
      hasTriggeredRef.current = true;
      onTrigger();
    }
  }, [quizCount, onTrigger]);

  // Scroll listener — counts paragraphs scrolled past
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // Count initial visible paragraphs to know where we start
    const paragraphs = el.querySelectorAll("p");
    let initialCount = 0;
    paragraphs.forEach((p) => {
      const rect = p.getBoundingClientRect();
      if (rect.bottom < 0) initialCount++;
    });
    paragraphsScrolledRef.current = initialCount;

    const handleScroll = () => {
      recordActivity();

      const currentY = window.scrollY;
      const direction = currentY > lastScrollYRef.current ? "down" : "up";
      lastScrollYRef.current = currentY;

      if (direction !== "down") return;

      // Count how many paragraph elements we've scrolled past
      const paragraphs = el.querySelectorAll("p");
      let visibleCount = 0;
      paragraphs.forEach((p) => {
        const rect = p.getBoundingClientRect();
        if (rect.bottom < 0) visibleCount++;
      });

      paragraphsScrolledRef.current = visibleCount;
      checkAndTrigger();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [contentRef, recordActivity, checkAndTrigger]);

  // Activity listeners (mouse move, keyboard, touch)
  useEffect(() => {
    const events = ["mousemove", "keydown", "touchstart", "click"] as const;
    events.forEach((e) =>
      window.addEventListener(e, recordActivity, { passive: true }),
    );
    return () => {
      events.forEach((e) => window.removeEventListener(e, recordActivity));
    };
  }, [recordActivity]);

  // Poll every 30s as a fallback check (handles slow readers who don't scroll much)
  useEffect(() => {
    const interval = setInterval(checkAndTrigger, 30_000);
    return () => clearInterval(interval);
  }, [checkAndTrigger]);

  /** Call this when the user completes or skips a quiz */
  const markQuizDone = useCallback(() => {
    lastQuizTimeRef.current = Date.now();
    paragraphsScrolledRef.current = 0;
    hasTriggeredRef.current = false;
    setQuizCount((c) => c + 1);
  }, []);

  return {
    quizCount,
    markQuizDone,
    isMaxReached: quizCount >= MAX_QUIZZES_PER_SESSION,
  };
}
