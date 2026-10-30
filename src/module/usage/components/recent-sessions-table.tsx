import type { Column } from './data-table';
import type { UsageSession } from '../types';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { DataTable } from './data-table';
import { formatTokens, formatDateTime } from '../utils/format';

export function RecentSessionsTable({ sessions }: { sessions: UsageSession[] }) {
  const { t } = useTranslate('usage');
  const router = useRouter();

  const columns: Column<UsageSession>[] = [
    { id: 'title', label: t('col.title'), render: (s) => s.title || s.id },
    { id: 'project', label: t('col.project'), render: (s) => s.project || '-' },
    { id: 'model', label: t('col.model'), render: (s) => s.model },
    {
      id: 'newContext',
      label: t('col.newContext'),
      align: 'right',
      render: (s) => formatTokens(s.new_context),
    },
    {
      id: 'lastRequest',
      label: t('col.lastRequest'),
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
