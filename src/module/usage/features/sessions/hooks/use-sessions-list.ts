import type { GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import type { SessionFilters } from '../utils/query';

import { useMemo, useState, useCallback } from 'react';

import { useSearchParams } from 'src/routes/hooks';

import { useFetch } from '../../../hooks/use-fetch';
import { sessionsQueryFromGrid } from '../utils/query';
import { getModels, getSessions } from '../../../api/usage';
import { useReportRange } from '../../../hooks/use-report-range';

const DEFAULT_PAGE_SIZE = 25;

export function useSessionsList() {
  const { range } = useReportRange();
  const searchParams = useSearchParams();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'last_request_at', sort: 'desc' },
  ]);
  const [filters, setFilters] = useState<SessionFilters>({
    userId: searchParams.get('user_id') ?? '',
  });

  const query = useMemo(
    () => sessionsQueryFromGrid({ ...paginationModel, sortModel, filters }),
    [paginationModel, sortModel, filters]
  );
  const load = useCallback(() => getSessions(range, query), [range, query]);
  const { data, error, loading } = useFetch(load);

  const loadModels = useCallback(() => getModels(range), [range]);
  const models = useFetch(loadModels).data ?? [];

  const setFilter = useCallback((patch: SessionFilters) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  return {
    rows: data?.items ?? [],
    rowCount: data?.pagination.total ?? 0,
    models: models.map((m) => m.model),
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    filters,
    setFilter,
    error,
    loading,
  };
}
