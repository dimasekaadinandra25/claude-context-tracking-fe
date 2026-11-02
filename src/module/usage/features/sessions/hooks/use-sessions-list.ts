import type { GridSortModel, GridPaginationModel } from '@mui/x-data-grid';
import type { SessionFilters } from '../utils/query';

import { useSearchParams } from 'react-router';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { useFetch } from '../../../hooks/use-fetch';
import { getModels, getSessions } from '../../../api/usage';
import { useDebounced } from '../../../hooks/use-debounced';
import { useReportRange } from '../../../hooks/use-report-range';
import { sortParam, sortModelFromParam, sessionsQueryFromGrid } from '../utils/query';

const DEFAULT_PAGE_SIZE = 25;

const FILTER_PARAMS: [keyof SessionFilters, string][] = [
  ['userId', 'user_id'],
  ['project', 'project'],
  ['model', 'model'],
  ['q', 'q'],
];

type Patch = Record<string, string | undefined>;

function filterPatch(draft: SessionFilters, params: URLSearchParams): Patch | null {
  const changed = FILTER_PARAMS.filter(
    ([field, key]) => (draft[field]?.trim() ?? '') !== (params.get(key) ?? '')
  );
  if (changed.length === 0) return null;
  return {
    page: undefined,
    ...Object.fromEntries(changed.map(([field, key]) => [key, draft[field]?.trim()])),
  };
}

export function useSessionsList() {
  const { range } = useReportRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const page = searchParams.get('page');
  const perPage = searchParams.get('per_page');
  const sort = searchParams.get('sort');
  const userId = searchParams.get('user_id') ?? '';
  const project = searchParams.get('project') ?? '';
  const model = searchParams.get('model') ?? '';
  const q = searchParams.get('q') ?? '';

  const setParams = useCallback(
    (patch: Patch) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([key, value]) =>
            value ? next.set(key, value) : next.delete(key)
          );
          return next;
        },
        { replace: true }
      ),
    [setSearchParams]
  );

  const reportRange = useMemo(
    () => (from && to ? { from: new Date(from), to: new Date(to), tz: range.tz } : range),
    [from, to, range]
  );
  const rangeRef = useRef(range);
  useEffect(() => {
    if (rangeRef.current === range) return;
    rangeRef.current = range;
    setParams({ from: undefined, to: undefined });
  }, [range, setParams]);

  const paginationModel = useMemo(
    () => ({ page: (Number(page) || 1) - 1, pageSize: Number(perPage) || DEFAULT_PAGE_SIZE }),
    [page, perPage]
  );
  const sortModel = useMemo(() => sortModelFromParam(sort), [sort]);
  const filters = useMemo(() => ({ userId, project, model, q }), [userId, project, model, q]);

  const [draft, setDraft] = useState<SessionFilters>(filters);
  const debounced = useDebounced(draft);
  useEffect(() => {
    const patch = filterPatch(debounced, searchParams);
    if (patch) setParams(patch);
  }, [debounced, searchParams, setParams]);

  const query = useMemo(
    () => sessionsQueryFromGrid({ ...paginationModel, sortModel, filters }),
    [paginationModel, sortModel, filters]
  );
  const load = useCallback(() => getSessions(reportRange, query), [reportRange, query]);
  const { data, error, loading } = useFetch(load);

  const loadModels = useCallback(() => getModels(reportRange), [reportRange]);
  const models = useFetch(loadModels).data ?? [];

  const setPaginationModel = useCallback(
    (next: GridPaginationModel) =>
      setParams({
        page: next.page ? String(next.page + 1) : undefined,
        per_page: next.pageSize === DEFAULT_PAGE_SIZE ? undefined : String(next.pageSize),
      }),
    [setParams]
  );
  const setSortModel = useCallback(
    (next: GridSortModel) => setParams({ sort: sortParam(next) }),
    [setParams]
  );
  const setFilter = useCallback(
    (patch: SessionFilters) => setDraft((prev) => ({ ...prev, ...patch })),
    []
  );

  const hourFilter = useMemo(() => (from && to ? { from, to } : null), [from, to]);
  const clearHourFilter = useCallback(
    () => setParams({ from: undefined, to: undefined }),
    [setParams]
  );

  return {
    hourFilter,
    clearHourFilter,
    rows: data?.items ?? [],
    rowCount: data?.pagination.total ?? 0,
    models: models.map((m) => m.model),
    paginationModel,
    setPaginationModel,
    sortModel,
    setSortModel,
    filters: draft,
    setFilter,
    error,
    loading,
  };
}
