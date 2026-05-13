import { useCallback, useRef } from "react";

export function useDebounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number = 300,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}
