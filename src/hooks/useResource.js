import { useCallback, useEffect, useRef, useState } from "react";
import { markAppReady } from "../utils/boot";

/**
 * useResource — tiny data-fetching hook for API-backed views.
 *
 * Handles the four states every listing/detail view needs
 * (loading / success / error / retry) with request de-duplication
 * via AbortController, so rapid filter changes never race.
 *
 * @param {() => Promise<any>} fetcher — stable per-call (wrap in useCallback)
 * @param {Array} deps — re-fetch when these change
 * @returns {{ data: any, loading: boolean, error: Error|null, retry: () => void }}
 */
export function useResource(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((cause) => {
        if (cause?.name === "AbortError" || controller.signal.aborted) return;
        setError(cause instanceof Error ? cause : new Error(String(cause)));
        setLoading(false);
      })
      .finally(() => {
        /* First settled fetch (success or error) dismisses the
           public site's first-load preloader. */
        if (!controller.signal.aborted) markAppReady();
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const retry = useCallback(() => setTick((value) => value + 1), []);

  return { data, loading, error, retry };
}

export default useResource;
