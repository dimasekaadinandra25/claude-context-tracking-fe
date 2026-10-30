import { useMemo, useCallback } from 'react';

import { useFetch } from '../../../hooks/use-fetch';
import { getOverview, getTimeseries } from '../../../api/usage';
import { useReportRange } from '../../../hooks/use-report-range';

export function useOverview() {
  const { range } = useReportRange();
  const load = useCallback(
    () => Promise.all([getOverview(range), getTimeseries(range, 'day', 'user')]),
    [range]
  );
  const { data, error, loading } = useFetch(load);
  const overview = data?.[0] ?? null;
  const points = data?.[1] ?? [];

  const nameOf = useMemo(() => {
    const names = new Map(overview?.people.map((p) => [p.user_id, p.full_name || p.email]));
    return (id: string) => names.get(id) ?? id;
  }, [overview]);

  return { overview, points, nameOf, error, loading };
}
