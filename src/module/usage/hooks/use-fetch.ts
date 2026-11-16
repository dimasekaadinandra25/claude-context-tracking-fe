import { useState, useEffect, useCallback } from 'react';

export const REFRESH_INTERVAL_MS = 60_000;

type FetchState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  updatedAt?: number;
};

const LOADING = { data: null, error: null, loading: true };

function useAutoRefresh(refresh: boolean, reload: () => void) {
  useEffect(() => {
    if (!refresh) return undefined;
    const refetchIfVisible = () => {
      if (!document.hidden) reload();
    };
    const timer = setInterval(refetchIfVisible, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', refetchIfVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refetchIfVisible);
    };
  }, [refresh, reload]);
}

export function useFetch<T>(load: () => Promise<T>, refresh = true) {
  const [state, setState] = useState<FetchState<T>>(LOADING);
  const [loaded, setLoaded] = useState(() => load);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  if (loaded !== load) {
    setLoaded(() => load);
    setState(LOADING);
  }

  useAutoRefresh(refresh, reload);

  useEffect(() => {
    let active = true;
    load()
      .then(
        (data) => active && setState({ data, error: null, loading: false, updatedAt: Date.now() })
      )
      .catch(
        (err: Error) =>
          active && setState((prev) => ({ ...prev, error: err.message, loading: false }))
      );
    return () => {
      active = false;
    };
  }, [load, version]);

  return { ...state, reload };
}
