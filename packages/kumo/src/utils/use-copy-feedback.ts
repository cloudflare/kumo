import { useCallback, useEffect, useRef, useState } from "react";

type CopyOperation = (isCurrent: () => boolean) => unknown;
type CopyErrorHandler = (error: unknown) => void;

/**
 * Runs a copy operation and keeps its success feedback visible from the most
 * recent successful attempt. Older asynchronous attempts cannot overwrite it.
 */
export function useCopyFeedback(duration = 2000) {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptRef = useRef(0);

  useEffect(() => {
    return () => {
      attemptRef.current += 1;
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const runCopy = useCallback(
    async (operation: CopyOperation, onError?: CopyErrorHandler) => {
      const attempt = ++attemptRef.current;
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }

      try {
        const isCurrent = () => attemptRef.current === attempt;
        await operation(isCurrent);
        if (attemptRef.current !== attempt) return false;

        setCopied(true);
        resetTimeoutRef.current = setTimeout(() => {
          if (attemptRef.current !== attempt) return;
          setCopied(false);
          resetTimeoutRef.current = null;
        }, duration);
        return true;
      } catch (error) {
        if (attemptRef.current !== attempt) return false;

        setCopied(false);
        onError?.(error);
        return false;
      }
    },
    [duration],
  );

  const reset = useCallback(() => {
    attemptRef.current += 1;
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
    setCopied(false);
  }, []);

  return { copied, runCopy, reset };
}
