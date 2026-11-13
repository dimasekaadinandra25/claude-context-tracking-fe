import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { Toolbar, DataGrid } from '@mui/x-data-grid';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

import { rangeCost } from '../../../utils/plan';
import { useFetch } from '../../../hooks/use-fetch';
import { ExportMonth } from '../components/export-month';
import { PageShell } from '../../../components/page-shell';
import { RangePicker } from '../../../components/range-picker';
import { GridActions } from '../../../components/grid-actions';
import { useReportRange } from '../../../hooks/use-report-range';
import { getDaily, getProjects, getOverview } from '../../../api/usage';
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

function useProjectsData(userId: string) {
  const { range } = useReportRange();
  const load = useCallback(() => getProjects(range, userId || undefined), [range, userId]);
  const { data, error, loading } = useFetch(load);
  const loadSpent = useCallback(
    () => Promise.all([getDaily(range, userId || undefined), getOverview(range)]),
    [range, userId]
  );
  const { data: spentData } = useFetch(loadSpent);
  const spent = spentData ? rangeCost(spentData[0], spentData[1].people) : null;
  return { data, error, loading, spent };
}

export function ProjectsView() {
  const { t } = useTranslate('usage');
  const { user } = useAuthContext();
  const isAdmin = !!user?.is_super_admin;
  const [userId, setUserId] = useState('');
  const { data, error, loading, spent } = useProjectsData(userId);
  const columns = useMemo(
    () => projectColumns(t, isAdmin, data ?? [], spent),
    [t, isAdmin, data, spent]
  );
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
            {isAdmin && <PersonFilter value={userId} onChange={setUserId} />}
            <ExportMonth userId={userId} />
          </Box>
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
