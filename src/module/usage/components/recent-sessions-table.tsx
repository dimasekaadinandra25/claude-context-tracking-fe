import type { Column } from './data-table';
import type { UsageSession } from '../types';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { RowLink } from './row-link';
import { DataTable } from './data-table';
import { ModelChips } from './model-chips';
import { sessionTitle } from '../utils/session';
import { formatTokens, formatDateTime } from '../utils/format';

const TITLE_SX = {
  maxWidth: { xs: 240, md: 'none' },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export function RecentSessionsTable({ sessions }: { sessions: UsageSession[] }) {
  const { t } = useTranslate('usage');
  const router = useRouter();

  const columns: Column<UsageSession>[] = [
    {
      id: 'title',
      label: t('col.title'),
      render: (s) => (
        <Box sx={TITLE_SX}>
          <RowLink href={paths.dashboard.session(s.id)}>{sessionTitle(s, t)}</RowLink>
        </Box>
      ),
    },
    { id: 'project', label: t('col.project'), render: (s) => s.project || '-' },
    { id: 'models', label: t('col.models'), render: (s) => <ModelChips models={s.models} /> },
    {
      id: 'newContext',
      label: t('col.newContextInRange'),
      align: 'right',
      render: (s) => formatTokens(s.new_context),
    },
    {
      id: 'lastRequest',
      label: t('col.lastRequest'),
      sx: { whiteSpace: { xs: 'nowrap' } },
      render: (s) => formatDateTime(s.last_request_at),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sessions}
      rowKey={(s) => s.id}
      emptyMessage={t('empty.sessions')}
      onRowClick={(s) => router.push(paths.dashboard.session(s.id))}
    />
  );
}
