import { useCallback, useEffect, useRef, useState } from "react";

export function useDraft(
  key: string,
  initialValue = "",
): [string, (value: string) => void, () => void] {
  const [value, setValue] = useState(() => {
    const stored = sessionStorage.getItem(key);
    return stored ?? initialValue;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (value) {
      timeoutRef.current = setTimeout(() => {
        sessionStorage.setItem(key, value);
      }, 300);
    } else {
      sessionStorage.removeItem(key);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [key, value]);

  const clearDraft = useCallback(() => {
    setValue("");
    sessionStorage.removeItem(key);
  }, [key]);

  return [value, setValue, clearDraft];
}
