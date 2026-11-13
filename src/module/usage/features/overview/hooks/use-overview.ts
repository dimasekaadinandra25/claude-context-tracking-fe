import { useMemo, useCallback } from 'react';

import { useFetch } from '../../../hooks/use-fetch';
import { toDailyByKey } from '../../../utils/series';
import { getOverview, getTimeseries } from '../../../api/usage';
import { useReportRange } from '../../../hooks/use-report-range';
import { lastDays, rangeDates, previousRange } from '../../../utils/range';

const TREND_DAYS = 7;
const NO_TRENDS = new Map<string, number[]>();

async function loadTrends(tz: string) {
  const week = lastDays(TREND_DAYS, new Date(), tz);
  const points = await getTimeseries(week, 'day', 'user');
  return toDailyByKey(points, rangeDates(week));
}

export function useOverview() {
  const { range } = useReportRange();
  const load = useCallback(
    () =>
      Promise.all([
        getOverview(range),
        getTimeseries(range, 'day', 'user'),
        getOverview(previousRange(range)),
        getTimeseries(range, 'hour', 'user'),
        loadTrends(range.tz),
      ]),
    [range]
  );
  const { data, error, loading, updatedAt } = useFetch(load);
  const [overview, points, previous, hourly, trends] = data ?? [null, [], null, [], NO_TRENDS];

  const nameOf = useMemo(() => {
    const names = new Map(overview?.people.map((p) => [p.user_id, p.full_name || p.email]));
    return (id: string) => names.get(id) ?? id;
  }, [overview]);

  return { overview, points, previous, hourly, trends, nameOf, error, loading, updatedAt };
}
