import type { useSessionsList } from '../hooks/use-sessions-list';

import { useMemo } from 'react';

import { Toolbar, DataGrid } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { GridActions } from '../../../components/grid-actions';
import { sessionColumns, defaultSessionColumns } from './session-columns';
import { useColumnVisibility } from '../../../hooks/use-column-visibility';

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
const VISIBILITY_KEY = 'usage.sessions.columns';
const TITLE_FIELD = 'title';
const EXPORT_FILE = 'sessions';

function SessionsToolbar() {
  return (
    <Toolbar>
      <GridActions fileName={EXPORT_FILE} />
    </Toolbar>
  );
}

export function SessionsGrid(props: Props) {
  const { t } = useTranslate('usage');
  const router = useRouter();
  const columns = useMemo(() => sessionColumns(t), [t]);
  const [visibility, setVisibility] = useColumnVisibility(
    VISIBILITY_KEY,
    defaultSessionColumns,
    TITLE_FIELD
  );

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
      columnVisibilityModel={visibility}
      onColumnVisibilityModelChange={setVisibility}
      showToolbar
      slots={{ toolbar: SessionsToolbar }}
      ignoreValueFormatterDuringExport
      onRowClick={(params) => router.push(paths.dashboard.session(String(params.id)))}
      autoHeight
      disableColumnFilter
      disableRowSelectionOnClick
      sx={{ cursor: 'pointer', minHeight: 400 }}
    />
  );
}
