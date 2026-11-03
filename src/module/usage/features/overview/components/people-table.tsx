import type { GridColDef } from '@mui/x-data-grid';
import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/shared/ui/iconify';
import { fToNow } from 'src/shared/utils/format-time';
import { niceMax } from 'src/module/usage/utils/scale';
import { RowLink } from 'src/module/usage/components/row-link';
import { GridActions } from 'src/module/usage/components/grid-actions';
import { formatTokens, formatDateTime } from 'src/module/usage/utils/format';
import { cacheRateColumn } from 'src/module/usage/components/cache-rate-column';
import { ShareBar } from 'src/module/usage/features/overview/components/share-bar';
import {
  useColumnVisibility,
  defaultPeopleColumns,
} from 'src/module/usage/hooks/use-column-visibility';

const VISIBILITY_KEY = 'usage.overview.people.columns';
const NAME_FIELD = 'name';
const EXPORT_FILE = 'members';
const WIDE = 180;
const NARROW = 120;
const TREND_DAYS = 7;
const SPARK_HEIGHT = 32;
const NO_TREND = Array<number>(TREND_DAYS).fill(0);
const STALE_HOURS = 24;
const PHONE_HIDDEN = [
  'share',
  'trend',
  'subagent_requests',
  'subagent_output_tokens',
  'current_model',
  'app_version',
  'last_synced_at',
];

const compareVersions = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

function latestVersion(people: OverviewPerson[]) {
  return people
    .map((p) => p.app_version)
    .reduce<
      string | null
    >((max, v) => (v && (!max || compareVersions(v, max) > 0) ? v : max), null);
}

function isStale(person: OverviewPerson) {
  if (person.is_active === false) return false;
  if (!person.last_synced_at) return true;
  return dayjs().diff(person.last_synced_at, 'hour', true) > STALE_HOURS;
}

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

const count = (value: number) => value.toLocaleString();

function VersionCell({ version, latest }: { version: string | null; latest: string | null }) {
  const { t } = useTranslate('usage');
  if (!version) return '—';
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Chip size="small" label={version} />
      {latest && compareVersions(version, latest) < 0 && (
        <Tooltip title={t('version.latest', { version: latest })}>
          <Chip size="small" color="warning" label={t('version.outdated')} />
        </Tooltip>
      )}
    </Box>
  );
}

function SyncedCell({ person }: { person: OverviewPerson }) {
  const { t } = useTranslate('usage');
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {formatDateTime(person.last_synced_at)}
      {isStale(person) && (
        <Tooltip
          title={
            person.last_synced_at
              ? t('sync.stale', { ago: fToNow(person.last_synced_at) })
              : t('sync.never')
          }
        >
          <Box component="span" sx={{ display: 'inline-flex', color: 'warning.main' }}>
            <Iconify icon="solar:danger-triangle-bold" />
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}

function numberColumn(
  field: keyof OverviewPerson & string,
  headerName: string,
  format: (value: number) => string
): GridColDef<OverviewPerson> {
  return { field, headerName, width: NARROW, valueFormatter: (value: number) => format(value) };
}

function nameColumn(headerName: string): GridColDef<OverviewPerson> {
  return {
    field: NAME_FIELD,
    headerName,
    hideable: false,
    flex: 1,
    minWidth: WIDE,
    valueGetter: (_v, row) => row.full_name || row.email,
    renderCell: ({ row, value, tabIndex }) => (
      <RowLink href={paths.dashboard.person(row.user_id)} tabIndex={tabIndex}>
        {value}
      </RowLink>
    ),
  };
}

function trendColumn(
  headerName: string,
  trends: Map<string, number[]>,
  color: string
): GridColDef<OverviewPerson> {
  return {
    field: 'trend',
    headerName,
    width: WIDE,
    display: 'flex',
    sortable: false,
    disableExport: true,
    renderCell: ({ row }) => (
      <SparkLineChart
        data={trends.get(row.user_id) ?? NO_TREND}
        height={SPARK_HEIGHT}
        color={color}
        showTooltip
        valueFormatter={(value) => formatTokens(value ?? 0)}
      />
    ),
  };
}

function versionColumn(headerName: string, latest: string | null): GridColDef<OverviewPerson> {
  return {
    field: 'app_version',
    headerName,
    width: WIDE,
    display: 'flex',
    renderCell: ({ row }) => <VersionCell version={row.app_version} latest={latest} />,
  };
}

function useColumns(
  people: OverviewPerson[],
  trends: Map<string, number[]>
): GridColDef<OverviewPerson>[] {
  const { t } = useTranslate('usage');
  const theme = useTheme();
  const scale = niceMax(Math.max(0, ...people.map((p) => p.new_context)));

  return [
    nameColumn(t('col.name')),
    numberColumn('new_context', t('col.newContext'), formatTokens),
    {
      field: 'share',
      headerName: t('col.share'),
      description: t('col.shareScale', { max: formatTokens(scale) }),
      width: WIDE,
      display: 'flex',
      disableExport: true,
      valueGetter: (_v, row) => row.new_context,
      renderCell: ({ row }) => <ShareBar value={row.new_context} max={scale} />,
    },
    trendColumn(t('col.trend'), trends, theme.vars.palette.primary.main),
    numberColumn('requests', t('col.requests'), count),
    numberColumn('output_tokens', t('col.outputTokens'), formatTokens),
    cacheRateColumn<OverviewPerson>(t),
    { ...numberColumn('subagent_requests', t('col.subagentRequests'), count), width: WIDE },
    numberColumn('subagent_output_tokens', t('col.subagentOutput'), formatTokens),
    { field: 'sessions', headerName: t('col.sessions'), width: NARROW },
    {
      field: 'current_model',
      headerName: t('col.currentModel'),
      width: WIDE,
      valueFormatter: (value: string) => value || '-',
    },
    versionColumn(t('col.appVersion'), latestVersion(people)),
    dateColumn('last_request_at', t('col.lastRequest')),
    {
      ...dateColumn('last_synced_at', t('col.lastSynced')),
      display: 'flex',
      renderCell: ({ row }) => <SyncedCell person={row} />,
    },
  ];
}

function PeopleHeader() {
  const { t } = useTranslate('usage');
  return (
    <CardHeader
      title={t('overview.people')}
      action={<GridActions fileName={EXPORT_FILE} />}
      sx={{ pb: 2 }}
    />
  );
}

type Props = {
  people: OverviewPerson[];
  trends: Map<string, number[]>;
};

export function PeopleTable({ people, trends }: Props) {
  const { t } = useTranslate('usage');
  const router = useRouter();
  const columns = useColumns(people, trends);
  const [visibility, setVisibility] = useColumnVisibility(
    VISIBILITY_KEY,
    defaultPeopleColumns,
    NAME_FIELD,
    PHONE_HIDDEN
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
      ignoreValueFormatterDuringExport
      autoHeight
      disableColumnFilter
      disableDensitySelector
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      sx={{ cursor: 'pointer' }}
    />
  );
}
