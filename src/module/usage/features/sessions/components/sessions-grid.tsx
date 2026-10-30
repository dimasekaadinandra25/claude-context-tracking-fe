import type { GridColDef } from '@mui/x-data-grid';
import type { UsageSession } from '../../../types';
import type { useSessionsList } from '../hooks/use-sessions-list';

import { DataGrid } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { ModelChips } from '../../../components/model-chips';
import { formatTokens, formatDateTime } from '../../../utils/format';

type Props = Pick<
  ReturnType<typeof useSessionsList>,
  | 'rows'
  | 'rowCount'
  | 'paginationModel'
  | 'setPaginationModel'
  | 'sortModel'
  | 'setSortModel'
  | 'loading'
>;

const PAGE_SIZES = [10, 25, 50, 100];
const WIDE = 220;
const NARROW = 120;

function useColumns(): GridColDef<UsageSession>[] {
  const { t } = useTranslate('usage');
  const tokens = (value: number) => formatTokens(value);
  const fixed = { sortable: false, width: NARROW };

  return [
    { field: 'title', headerName: t('col.title'), sortable: false, flex: 1, minWidth: WIDE },
    { field: 'user_name', headerName: t('col.person'), ...fixed },
    { field: 'project', headerName: t('col.project'), sortable: false, minWidth: WIDE },
    {
      field: 'models',
      headerName: t('col.models'),
      sortable: false,
      width: WIDE,
      renderCell: ({ row }) => <ModelChips models={row.models} />,
    },
    {
      field: 'new_context',
      headerName: t('col.newContext'),
      width: NARROW,
      valueFormatter: tokens,
    },
    {
      field: 'latest_context',
      headerName: t('col.latestPeak'),
      ...fixed,
      valueGetter: (_v, row) =>
        `${formatTokens(row.latest_context)} / ${formatTokens(row.peak_context)}`,
    },
    { field: 'requests', headerName: t('col.requests'), ...fixed },
    { field: 'compactions', headerName: t('col.compactions'), ...fixed },
    {
      field: 'last_request_at',
      headerName: t('col.lastRequest'),
      width: WIDE,
      valueFormatter: (value: string) => formatDateTime(value),
    },
  ];
}

export function SessionsGrid(props: Props) {
  const router = useRouter();
  const columns = useColumns();

  return (
    <DataGrid
      rows={props.rows}
      columns={columns}
      rowCount={props.rowCount}
      loading={props.loading}
      paginationMode="server"
      sortingMode="server"
      pageSizeOptions={PAGE_SIZES}
      paginationModel={props.paginationModel}
      onPaginationModelChange={props.setPaginationModel}
      sortModel={props.sortModel}
      onSortModelChange={props.setSortModel}
      onRowClick={(params) => router.push(paths.dashboard.session(String(params.id)))}
      disableColumnFilter
      disableRowSelectionOnClick
      sx={{ cursor: 'pointer', minHeight: 400 }}
    />
  );
}
