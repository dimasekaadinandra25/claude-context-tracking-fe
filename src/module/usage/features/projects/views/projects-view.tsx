import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Toolbar, DataGrid } from '@mui/x-data-grid';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

import { getProjects } from '../../../api/usage';
import { useFetch } from '../../../hooks/use-fetch';
import { PageShell } from '../../../components/page-shell';
import { RangePicker } from '../../../components/range-picker';
import { GridActions } from '../../../components/grid-actions';
import { useReportRange } from '../../../hooks/use-report-range';
import { PersonFilter } from '../../sessions/components/session-filters';
import { useColumnVisibility } from '../../../hooks/use-column-visibility';
import { PROJECT_FIELD, projectColumns } from '../components/project-columns';

const VISIBILITY_KEY = 'usage.projects.columns';
const EXPORT_FILE = 'projects';
const ALL_COLUMNS = {};
const PHONE_HIDDEN = ['members', 'models', 'compactions', 'sessions_near_full'];

function ProjectsToolbar() {
  return (
    <Toolbar>
      <GridActions fileName={EXPORT_FILE} />
    </Toolbar>
  );
}

export function ProjectsView() {
  const { t } = useTranslate('usage');
  const { user } = useAuthContext();
  const isAdmin = !!user?.is_super_admin;
  const { range } = useReportRange();
  const [userId, setUserId] = useState('');
  const load = useCallback(() => getProjects(range, userId || undefined), [range, userId]);
  const { data, error, loading } = useFetch(load);
  const columns = useMemo(() => projectColumns(t, isAdmin), [t, isAdmin]);
  const [visibility, setVisibility] = useColumnVisibility(
    VISIBILITY_KEY,
    ALL_COLUMNS,
    PROJECT_FIELD,
    PHONE_HIDDEN
  );

  return (
    <PageShell title={t('projects.title')} action={<RangePicker quick />} error={error}>
      <Card>
        <Stack spacing={2} sx={{ p: 2 }}>
          {isAdmin && (
            <Box>
              <PersonFilter value={userId} onChange={setUserId} />
            </Box>
          )}
          <DataGrid
            rows={data ?? []}
            columns={columns}
            loading={loading}
            getRowId={(p) => p.project}
            columnVisibilityModel={visibility}
            onColumnVisibilityModelChange={setVisibility}
            localeText={{ noRowsLabel: t('empty.projects') }}
            showToolbar
            slots={{ toolbar: ProjectsToolbar }}
            ignoreValueFormatterDuringExport
            autoHeight
            disableColumnFilter
            disableRowSelectionOnClick
            hideFooterSelectedRowCount
          />
        </Stack>
      </Card>
    </PageShell>
  );
}
