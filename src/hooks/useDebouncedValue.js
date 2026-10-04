import { useEffect, useRef, useState } from "react";

/**
 * useDebouncedValue — delays a fast-changing value (search inputs)
 * so server queries fire only after typing settles.
 *
 * @param {any} value
 * @param {number} delayMs
 */
export function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer.current);
  }, [value, delayMs]);

  return debounced;
}

export default useDebouncedValue;
