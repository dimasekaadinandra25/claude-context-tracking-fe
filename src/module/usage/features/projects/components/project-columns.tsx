import type { TFunction } from 'i18next';
import type { GridColDef } from '@mui/x-data-grid';
import type { ProjectUsage } from '../../../types';

import { paths } from 'src/routes/paths';

import { formatTokens } from '../../../utils/format';
import { RowLink } from '../../../components/row-link';
import { ModelChips } from '../../../components/model-chips';
import { cacheRateColumn } from '../../../components/cache-rate-column';
import { OverheadBar, overheadTotal } from '../../../components/overhead';
import { PERCENT, formatUsd, oneDecimal, OUTPUT_WEIGHT } from '../../../utils/plan';

export const PROJECT_FIELD = 'project';

const WIDTH = { project: 180, models: 170, number: 120, overhead: 170 };

type Field = keyof ProjectUsage & string;

const count = (value: number) => value.toLocaleString();

const numberColumn = (
  field: Field,
  headerName: string,
  format: (value: number) => string = count
): GridColDef<ProjectUsage> => ({
  field,
  headerName,
  width: WIDTH.number,
  valueFormatter: (value: number) => format(value),
});

export const projectWeight = (row: ProjectUsage) =>
  row.input_tokens +
  row.cache_write_tokens +
  row.cache_read_tokens +
  OUTPUT_WEIGHT * row.output_tokens;

const projectHref = (project: string) =>
  `${paths.dashboard.sessions}?${new URLSearchParams({ project })}`;

type Share = (row: ProjectUsage) => number;

const shareColumn = (headerName: string, share: Share): GridColDef<ProjectUsage> => ({
  field: 'share',
  headerName,
  width: WIDTH.number,
  valueGetter: (_v, row) => share(row) * PERCENT,
  valueFormatter: (value: number) => `${oneDecimal(value)}%`,
});

const costColumn = (
  headerName: string,
  share: Share,
  spent: number | null
): GridColDef<ProjectUsage> => ({
  field: 'cost',
  headerName,
  width: WIDTH.number,
  valueGetter: (_v, row) => (spent === null ? null : spent * share(row)),
  valueFormatter: (value: number | null) => (value === null ? '—' : formatUsd(value)),
});

const overheadColumn = (headerName: string): GridColDef<ProjectUsage> => ({
  field: 'overhead',
  headerName,
  width: WIDTH.overhead,
  display: 'flex',
  valueGetter: (_v, row) => (row.overhead ? overheadTotal(row.overhead) : null),
  renderCell: ({ row }) => (row.overhead ? <OverheadBar overhead={row.overhead} /> : '—'),
});

export function projectColumns(
  t: TFunction,
  isAdmin: boolean,
  rows: ProjectUsage[] = [],
  spent: number | null = null
): GridColDef<ProjectUsage>[] {
  const total = rows.reduce((sum, row) => sum + projectWeight(row), 0);
  const share = (row: ProjectUsage) => (total > 0 ? projectWeight(row) / total : 0);
  return [
    {
      field: PROJECT_FIELD,
      headerName: t('col.project'),
      hideable: false,
      flex: 1,
      minWidth: WIDTH.project,
      valueGetter: (_v, row) => row.project || t('projects.private'),
      renderCell: ({ row, value, tabIndex }) =>
        row.project ? (
          <RowLink href={projectHref(row.project)} tabIndex={tabIndex}>
            {value}
          </RowLink>
        ) : (
          value
        ),
    },
    numberColumn('new_context', t('col.newContext'), formatTokens),
    shareColumn(t('projects.share'), share),
    costColumn(t('projects.cost'), share, spent),
    numberColumn('requests', t('col.requests')),
    numberColumn('sessions', t('col.sessions')),
    ...(isAdmin ? [numberColumn('members', t('col.members'))] : []),
    {
      field: 'models',
      headerName: t('col.models'),
      sortable: false,
      width: WIDTH.models,
      renderCell: ({ row }) => <ModelChips models={row.models} />,
    },
    cacheRateColumn<ProjectUsage>(t),
    numberColumn('compactions', t('pressure.compactions')),
    numberColumn('sessions_near_full', t('pressure.nearFull')),
    overheadColumn(t('col.overhead')),
  ];
}
