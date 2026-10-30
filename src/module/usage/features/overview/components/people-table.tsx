import type { OverviewPerson } from '../../../types';
import type { Column } from '../../../components/data-table';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { DataTable } from '../../../components/data-table';
import { formatTokens, formatDateTime } from '../../../utils/format';

export function PeopleTable({ people }: { people: OverviewPerson[] }) {
  const { t } = useTranslate('usage');
  const router = useRouter();

  const columns: Column<OverviewPerson>[] = [
    { id: 'name', label: t('col.name'), render: (p) => p.full_name || p.email },
    {
      id: 'newContext',
      label: t('col.newContext'),
      align: 'right',
      render: (p) => formatTokens(p.new_context),
    },
    {
      id: 'requests',
      label: t('col.requests'),
      align: 'right',
      render: (p) => p.requests.toLocaleString(),
    },
    { id: 'sessions', label: t('col.sessions'), align: 'right', render: (p) => p.sessions },
    { id: 'model', label: t('col.currentModel'), render: (p) => p.current_model || '-' },
    {
      id: 'lastRequest',
      label: t('col.lastRequest'),
      render: (p) => formatDateTime(p.last_request_at),
    },
    {
      id: 'lastSynced',
      label: t('col.lastSynced'),
      render: (p) => formatDateTime(p.last_synced_at),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={people}
      rowKey={(p) => p.user_id}
      emptyMessage={t('empty.people')}
      onRowClick={(p) => router.push(paths.dashboard.person(p.user_id))}
    />
  );
}
