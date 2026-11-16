import type { AdminRole, AdminUser } from '../../../types';
import type { Column } from '../../../components/data-table';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useTranslate } from 'src/locales';
import { Label } from 'src/shared/ui/label';

import { ADMIN_ROLES } from '../../../types';
import { DataTable } from '../../../components/data-table';
import { formatTokens, formatDateTime } from '../../../utils/format';

export type UserRow = AdminUser & {
  last_synced_at: string | null;
  monthly_new_context: number | null;
};

export type UserAction = 'keys' | 'budget' | 'reset' | 'toggle';

const ROLE_WIDTH = 200;

type Props = {
  users: UserRow[];
  selfId?: string;
  onAction: (action: UserAction, user: UserRow) => void;
  onRoleChange: (user: UserRow, role: AdminRole) => void;
};

export function roleOf(roles: string[]): AdminRole {
  return [...ADMIN_ROLES].reverse().find((role) => roles.includes(role)) ?? 'member';
}

type RoleSelectProps = { user: UserRow; self: boolean; onChange: Props['onRoleChange'] };

function RoleSelect({ user, self, onChange }: RoleSelectProps) {
  const { t } = useTranslate('usage');
  const current = roleOf(user.roles);
  const select = (
    <TextField
      select
      size="small"
      value={current}
      disabled={self}
      onChange={(event) => {
        const role = event.target.value as AdminRole;
        if (role !== current) onChange(user, role);
      }}
      slotProps={{ htmlInput: { 'aria-label': `${t('col.role')} ${user.email}` } }}
      sx={{ minWidth: ROLE_WIDTH }}
    >
      {ADMIN_ROLES.map((role) => (
        <MenuItem key={role} value={role}>
          {t(`role.${role}`)}
        </MenuItem>
      ))}
    </TextField>
  );
  return self ? (
    <Tooltip title={t('role.own')}>
      <span>{select}</span>
    </Tooltip>
  ) : (
    select
  );
}

function RowActions({ user: u, onAction }: { user: UserRow; onAction: Props['onAction'] }) {
  const { t } = useTranslate('usage');
  return (
    <Box sx={{ display: 'flex', gap: 1, whiteSpace: 'nowrap' }}>
      <Button size="small" onClick={() => onAction('keys', u)}>
        {t('admin.keys')}
      </Button>
      <Button size="small" onClick={() => onAction('budget', u)}>
        {t('admin.budget')}
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
}

export function UsersTable({ users, selfId, onAction, onRoleChange }: Props) {
  const { t } = useTranslate('usage');

  const actions = (u: UserRow) => <RowActions user={u} onAction={onAction} />;

  const columns: Column<UserRow>[] = [
    { id: 'name', label: t('col.name'), render: (u) => u.full_name || u.username },
    { id: 'email', label: t('col.email'), render: (u) => u.email },
    {
      id: 'role',
      label: t('col.role'),
      render: (u) => <RoleSelect user={u} self={u.id === selfId} onChange={onRoleChange} />,
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
    {
      id: 'budget',
      label: t('col.budget'),
      render: (u) => (u.monthly_new_context === null ? '—' : formatTokens(u.monthly_new_context)),
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
