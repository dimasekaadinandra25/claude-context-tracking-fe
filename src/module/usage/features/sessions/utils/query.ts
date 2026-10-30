import type { GridSortModel } from '@mui/x-data-grid';

export type SessionFilters = {
  userId?: string;
  project?: string;
  model?: string;
  q?: string;
};

export type GridQuery = {
  page: number;
  pageSize: number;
  sortModel: GridSortModel;
  filters: SessionFilters;
};

const DEFAULT_SORT = '-last_request_at';

function sortParam(sortModel: GridSortModel): string {
  const [first] = sortModel;
  if (!first?.sort) return DEFAULT_SORT;
  return first.sort === 'desc' ? `-${first.field}` : first.field;
}

export function sessionsQueryFromGrid({
  page,
  pageSize,
  sortModel,
  filters,
}: GridQuery): Record<string, string> {
  const optional: [string, string | undefined][] = [
    ['user_id', filters.userId],
    ['project', filters.project],
    ['model', filters.model],
    ['q', filters.q],
  ];
  const query: Record<string, string> = {
    page: String(page + 1),
    per_page: String(pageSize),
    sort: sortParam(sortModel),
  };
  optional.forEach(([key, value]) => {
    const trimmed = value?.trim();
    if (trimmed) query[key] = trimmed;
  });
  return query;
}
