import { useCallback } from 'react';

import { useFetch } from '../../../hooks/use-fetch';
import { useReportRange } from '../../../hooks/use-report-range';
import { getModels, getTimeseries, getMemberModels } from '../../../api/usage';

export function useModels() {
  const { range } = useReportRange();
  const load = useCallback(
    () =>
      Promise.all([getModels(range), getTimeseries(range, 'day', 'model'), getMemberModels(range)]),
    [range]
  );
  const { data, error, loading } = useFetch(load);

  return {
    models: data?.[0] ?? null,
    points: data?.[1] ?? [],
    members: data?.[2] ?? [],
    error,
    loading,
  };
}
