import { useCallback } from 'react';

import { useParams } from 'src/routes/hooks';

import { useAuthContext } from 'src/module/core/features/auth/hooks';

import { useFetch } from '../../../hooks/use-fetch';
import { previousRange } from '../../../utils/range';
import { useReportRange } from '../../../hooks/use-report-range';
import { getOverview, getSessions, getTimeseries } from '../../../api/usage';

const RECENT_SESSIONS = '10';

export function usePerson() {
  const { user } = useAuthContext();
  const { id } = useParams();
  const { range } = useReportRange();
  const isAdmin = !!user?.is_super_admin;
  const userId = (isAdmin && id) || user?.id || '';

  const load = useCallback(
    () =>
      Promise.all([
        getOverview(range, userId),
        getTimeseries(range, 'day', 'model', userId),
        getSessions(range, { user_id: userId, per_page: RECENT_SESSIONS }),
        getOverview(previousRange(range), userId),
      ]),
    [range, userId]
  );
  const { data, error, loading } = useFetch(load);

  const [overview, points, page, previous] = data ?? [null, [], null, null];

  return {
    isAdmin,
    userId,
    overview,
    previous,
    person: overview?.people[0] ?? null,
    points,
    sessions: page?.items ?? [],
    error,
    loading,
  };
}
