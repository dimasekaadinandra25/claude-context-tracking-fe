import type { TFunction } from 'i18next';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import type { UsageSession } from '../../../types';

import { sessionTitle } from '../../../utils/session';
import { ModelChips } from '../../../components/model-chips';
import { formatTokens, formatDateTime } from '../../../utils/format';

const WIDTH = { title: 150, person: 120, models: 170, tokens: 110, latestPeak: 140, date: 170 };

export const defaultSessionColumns: GridColumnVisibilityModel = {
  project: false,
  latest_context: false,
  peak_context: false,
  requests: false,
  subagent_requests: false,
  compactions: false,
};

type Field = keyof UsageSession & string;

const tokenColumn = (field: Field, headerName: string): GridColDef<UsageSession> => ({
  field,
  headerName,
  sortable: false,
  width: WIDTH.tokens,
  valueFormatter: (value: number) => formatTokens(value),
});

const countColumn = (field: Field, headerName: string): GridColDef<UsageSession> => ({
  field,
  headerName,
  sortable: false,
  width: WIDTH.tokens,
});

export function sessionColumns(t: TFunction): GridColDef<UsageSession>[] {
  return [
    {
      field: 'title',
      headerName: t('col.title'),
      sortable: false,
      flex: 1,
      minWidth: WIDTH.title,
      valueGetter: (_v, row) => sessionTitle(row, t),
    },
    { field: 'user_name', headerName: t('col.person'), sortable: false, width: WIDTH.person },
    { field: 'project', headerName: t('col.project'), sortable: false, width: WIDTH.date },
    {
      field: 'models',
      headerName: t('col.models'),
      sortable: false,
      width: WIDTH.models,
      renderCell: ({ row }) => <ModelChips models={row.models} />,
    },
    { ...tokenColumn('new_context', t('col.newContext')), sortable: true },
    tokenColumn('output_tokens', t('col.outputTokens')),
    {
      field: 'latest_peak',
      headerName: t('col.latestPeak'),
      sortable: false,
      width: WIDTH.latestPeak,
      disableExport: true,
      valueGetter: (_v, row) =>
        `${formatTokens(row.latest_context)} / ${formatTokens(row.peak_context)}`,
    },
    tokenColumn('latest_context', t('col.latestContext')),
    tokenColumn('peak_context', t('col.peakContext')),
    countColumn('requests', t('col.requests')),
    countColumn('subagent_requests', t('col.subagentRequests')),
    countColumn('compactions', t('col.compactions')),
    {
      field: 'last_request_at',
      headerName: t('col.lastRequest'),
      width: WIDTH.date,
      valueFormatter: (value: string) => formatDateTime(value),
    },
  ];
}
