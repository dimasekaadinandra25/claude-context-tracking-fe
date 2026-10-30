import { useCallback } from 'react';

import { useFetch } from '../../../hooks/use-fetch';
import { getModels, getTimeseries } from '../../../api/usage';
import { useReportRange } from '../../../hooks/use-report-range';

export function useModels() {
  const { range } = useReportRange();
  const load = useCallback(
    () => Promise.all([getModels(range), getTimeseries(range, 'day', 'model')]),
    [range]
  );
  const { data, error, loading } = useFetch(load);

  return { models: data?.[0] ?? null, points: data?.[1] ?? [], error, loading };
}
