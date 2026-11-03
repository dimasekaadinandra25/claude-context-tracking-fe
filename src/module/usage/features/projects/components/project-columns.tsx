import type { TFunction } from 'i18next';
import type { GridColDef } from '@mui/x-data-grid';
import type { ProjectUsage } from '../../../types';

import { paths } from 'src/routes/paths';

import { formatTokens } from '../../../utils/format';
import { RowLink } from '../../../components/row-link';
import { ModelChips } from '../../../components/model-chips';
import { cacheRateColumn } from '../../../components/cache-rate-column';
import { OverheadBar, overheadTotal } from '../../../components/overhead';

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

const projectHref = (project: string) =>
  `${paths.dashboard.sessions}?${new URLSearchParams({ project })}`;

export function projectColumns(t: TFunction, isAdmin: boolean): GridColDef<ProjectUsage>[] {
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
    {
      field: 'overhead',
      headerName: t('col.overhead'),
      width: WIDTH.overhead,
      display: 'flex',
      valueGetter: (_v, row) => (row.overhead ? overheadTotal(row.overhead) : null),
      renderCell: ({ row }) => (row.overhead ? <OverheadBar overhead={row.overhead} /> : '—'),
    },
  ];
}
