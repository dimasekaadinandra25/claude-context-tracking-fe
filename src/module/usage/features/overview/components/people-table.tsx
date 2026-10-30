import type { GridColDef } from '@mui/x-data-grid';
import type { OverviewPerson } from 'src/module/usage/types';

import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import { DataGrid, GridViewColumnIcon, ColumnsPanelTrigger } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { niceMax } from 'src/module/usage/utils/scale';
import { formatTokens, formatDateTime } from 'src/module/usage/utils/format';
import { ShareBar } from 'src/module/usage/features/overview/components/share-bar';
import {
  useColumnVisibility,
  defaultPeopleColumns,
} from 'src/module/usage/features/overview/hooks/use-column-visibility';

const VISIBILITY_KEY = 'usage.overview.people.columns';
const NAME_FIELD = 'name';
const WIDE = 180;
const NARROW = 120;

function dateColumn(
  field: 'last_request_at' | 'last_synced_at',
  headerName: string
): GridColDef<OverviewPerson> {
  return {
    field,
    headerName,
    width: WIDE,
    valueFormatter: (value: string | null) => formatDateTime(value),
  };
}

function useColumns(people: OverviewPerson[]): GridColDef<OverviewPerson>[] {
  const { t } = useTranslate('usage');
  const scale = niceMax(Math.max(0, ...people.map((p) => p.new_context)));

  return [
    {
      field: NAME_FIELD,
      headerName: t('col.name'),
      hideable: false,
      flex: 1,
      minWidth: WIDE,
      valueGetter: (_v, row) => row.full_name || row.email,
    },
    {
      field: 'new_context',
      headerName: t('col.newContext'),
      width: NARROW,
      valueFormatter: (value: number) => formatTokens(value),
    },
    {
      field: 'share',
      headerName: t('col.share'),
      description: t('col.shareScale', { max: formatTokens(scale) }),
      width: WIDE,
      display: 'flex',
      valueGetter: (_v, row) => row.new_context,
      renderCell: ({ row }) => <ShareBar value={row.new_context} max={scale} />,
    },
    {
      field: 'requests',
      headerName: t('col.requests'),
      width: NARROW,
      valueFormatter: (value: number) => value.toLocaleString(),
    },
    { field: 'sessions', headerName: t('col.sessions'), width: NARROW },
    {
      field: 'current_model',
      headerName: t('col.currentModel'),
      width: WIDE,
      valueFormatter: (value: string) => value || '-',
    },
    dateColumn('last_request_at', t('col.lastRequest')),
    dateColumn('last_synced_at', t('col.lastSynced')),
  ];
}

function PeopleHeader() {
  const { t } = useTranslate('usage');
  return (
    <CardHeader
      title={t('overview.people')}
      action={
        <ColumnsPanelTrigger render={<IconButton aria-label={t('overview.columns')} />}>
          <GridViewColumnIcon />
        </ColumnsPanelTrigger>
      }
      sx={{ pb: 2 }}
    />
  );
}

export function PeopleTable({ people }: { people: OverviewPerson[] }) {
  const { t } = useTranslate('usage');
  const router = useRouter();
  const columns = useColumns(people);
  const [visibility, setVisibility] = useColumnVisibility(
    VISIBILITY_KEY,
    defaultPeopleColumns,
    NAME_FIELD
  );

  return (
    <DataGrid
      rows={people}
      columns={columns}
      getRowId={(p) => p.user_id}
      columnVisibilityModel={visibility}
      onColumnVisibilityModelChange={setVisibility}
      onRowClick={({ row }) => router.push(paths.dashboard.person(row.user_id))}
      localeText={{ noRowsLabel: t('empty.people') }}
      showToolbar
      slots={{ toolbar: PeopleHeader }}
      autoHeight
      disableColumnFilter
      disableDensitySelector
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      sx={{ cursor: 'pointer' }}
    />
  );
}
