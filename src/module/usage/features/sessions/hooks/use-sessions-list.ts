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

type SetSearchParams = ReturnType<typeof useSearchParams>[1];

function useParamSetter(setSearchParams: SetSearchParams) {
  return useCallback(
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
}

function useRangeReset(range: unknown, setParams: (patch: Patch) => void) {
  const rangeRef = useRef(range);
  useEffect(() => {
    if (rangeRef.current === range) return;
    rangeRef.current = range;
    setParams({ from: undefined, to: undefined });
  }, [range, setParams]);
}

function useFilterDraft(
  filters: SessionFilters,
  searchParams: URLSearchParams,
  setParams: (patch: Patch) => void
) {
  const [draft, setDraft] = useState<SessionFilters>(filters);
  const debounced = useDebounced(draft);
  useEffect(() => {
    const patch = filterPatch(debounced, searchParams);
    if (patch) setParams(patch);
  }, [debounced, searchParams, setParams]);
  return [draft, setDraft] as const;
}

function readParams(searchParams: URLSearchParams) {
  return {
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    page: searchParams.get('page'),
    perPage: searchParams.get('per_page'),
    sort: searchParams.get('sort'),
    userId: searchParams.get('user_id') ?? '',
    project: searchParams.get('project') ?? '',
    model: searchParams.get('model') ?? '',
    q: searchParams.get('q') ?? '',
  };
}

function useSessionsData(
  reportRange: Parameters<typeof getSessions>[0],
  query: Parameters<typeof getSessions>[1]
) {
  const load = useCallback(() => getSessions(reportRange, query), [reportRange, query]);
  const { data, error, loading } = useFetch(load);

  const loadModels = useCallback(() => getModels(reportRange), [reportRange]);
  const models = useFetch(loadModels).data ?? [];
  return { data, error, loading, models };
}

function useHourFilter(from: string | null, to: string | null, setParams: (patch: Patch) => void) {
  const hourFilter = useMemo(() => (from && to ? { from, to } : null), [from, to]);
  const clearHourFilter = useCallback(
    () => setParams({ from: undefined, to: undefined }),
    [setParams]
  );
  return { hourFilter, clearHourFilter };
}

function useGridModels(page: string | null, perPage: string | null, sort: string | null) {
  const paginationModel = useMemo(
    () => ({ page: (Number(page) || 1) - 1, pageSize: Number(perPage) || DEFAULT_PAGE_SIZE }),
    [page, perPage]
  );
  const sortModel = useMemo(() => sortModelFromParam(sort), [sort]);
  return { paginationModel, sortModel };
}

function useGridSetters(setParams: (patch: Patch) => void) {
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
  return { setPaginationModel, setSortModel };
}

export function useSessionsList() {
  const { range } = useReportRange();
  const [searchParams, setSearchParams] = useSearchParams();
  const { from, to, page, perPage, sort, userId, project, model, q } = readParams(searchParams);

  const setParams = useParamSetter(setSearchParams);

  const reportRange = useMemo(
    () => (from && to ? { from: new Date(from), to: new Date(to), tz: range.tz } : range),
    [from, to, range]
  );
  useRangeReset(range, setParams);

  const { paginationModel, sortModel } = useGridModels(page, perPage, sort);
  const filters = useMemo(() => ({ userId, project, model, q }), [userId, project, model, q]);

  const [draft, setDraft] = useFilterDraft(filters, searchParams, setParams);

  const query = useMemo(
    () => sessionsQueryFromGrid({ ...paginationModel, sortModel, filters }),
    [paginationModel, sortModel, filters]
  );
  const { data, error, loading, models } = useSessionsData(reportRange, query);

  const { setPaginationModel, setSortModel } = useGridSetters(setParams);
  const setFilter = useCallback(
    (patch: SessionFilters) => setDraft((prev) => ({ ...prev, ...patch })),
    [setDraft]
  );

  const { hourFilter, clearHourFilter } = useHourFilter(from, to, setParams);

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
