import type { AdminUser } from '../../../types';
import type { Column } from '../../../components/data-table';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';
import { Label } from 'src/shared/ui/label';

import { formatDateTime } from '../../../utils/format';
import { DataTable } from '../../../components/data-table';

export type UserRow = AdminUser & { last_synced_at: string | null };

export type UserAction = 'keys' | 'reset' | 'toggle';

type Props = {
  users: UserRow[];
  onAction: (action: UserAction, user: UserRow) => void;
};

export function UsersTable({ users, onAction }: Props) {
  const { t } = useTranslate('usage');

  const actions = (u: UserRow) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
      <Button size="small" onClick={() => onAction('keys', u)}>
        {t('admin.keys')}
      </Button>
      <Button size="small" onClick={() => onAction('reset', u)}>
        {t('admin.resetPassword')}
      </Button>
      <Button
        size="small"
        color={u.is_active ? 'error' : 'success'}
        onClick={() => onAction('toggle', u)}
      >
        {u.is_active ? t('admin.deactivate') : t('admin.activate')}
      </Button>
    </Box>
  );

  const columns: Column<UserRow>[] = [
    { id: 'name', label: t('col.name'), render: (u) => u.full_name || u.username },
    { id: 'email', label: t('col.email'), render: (u) => u.email },
    {
      id: 'role',
      label: t('col.role'),
      render: (u) => (u.roles.includes('super_admin') ? t('role.admin') : t('role.member')),
    },
    {
      id: 'active',
      label: t('col.status'),
      render: (u) => (
        <Label color={u.is_active ? 'success' : 'default'}>
          {u.is_active ? t('status.active') : t('status.inactive')}
        </Label>
      ),
    },
    {
      id: 'lastSynced',
      label: t('col.lastSynced'),
      render: (u) => formatDateTime(u.last_synced_at),
    },
    { id: 'actions', align: 'right', render: actions },
  ];

  return (
    <DataTable
      columns={columns}
      rows={users}
      rowKey={(u) => u.id}
      emptyMessage={t('empty.people')}
    />
  );
}
