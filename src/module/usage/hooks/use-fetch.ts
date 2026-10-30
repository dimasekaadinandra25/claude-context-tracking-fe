import { useState, useEffect, useCallback } from 'react';

export const REFRESH_INTERVAL_MS = 60_000;

type FetchState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useFetch<T>(load: () => Promise<T>) {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
  }, [load]);

  useEffect(() => {
    const timer = setInterval(() => setVersion((v) => v + 1), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    let active = true;
    load()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch(
        (err: Error) => active && setState({ data: null, error: err.message, loading: false })
      );
    return () => {
      active = false;
    };
  }, [load, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { ...state, reload };
}
