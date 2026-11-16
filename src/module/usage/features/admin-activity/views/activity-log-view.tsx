import type { AuditLog } from '../../../types';
import type { Column } from '../../../components/data-table';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';

import { useTranslate } from 'src/locales';

import { useFetch } from '../../../hooks/use-fetch';
import { formatDateTime } from '../../../utils/format';
import { adminListAuditLogs } from '../../../api/usage';
import { DataTable } from '../../../components/data-table';
import { PageShell } from '../../../components/page-shell';

export const AUDIT_ACTIONS = [
  'user.create',
  'user.deactivate',
  'user.activate',
  'user.reset_password',
  'user.change_password',
  'api_key.issue',
  'api_key.reveal',
  'api_key.revoke',
  'alert_settings.update',
];

export const PAGE_SIZE = 25;
const FILTER_WIDTH = 240;

function ActionFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useTranslate('usage');

  return (
    <TextField
      select
      size="small"
      label={t('auditLog.action')}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: FILTER_WIDTH }}
    >
      <MenuItem value="">{t('auditLog.allActions')}</MenuItem>
      {AUDIT_ACTIONS.map((action) => (
        <MenuItem key={action} value={action}>
          {t(`auditLog.actions.${action}`)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function useColumns(): Column<AuditLog>[] {
  const { t } = useTranslate('usage');
  return [
    { id: 'time', label: t('auditLog.time'), render: (l) => formatDateTime(l.created_at) },
    { id: 'actor', label: t('auditLog.actor'), render: (l) => l.actor_email || '—' },
    {
      id: 'action',
      label: t('auditLog.action'),
      render: (l) => t(`auditLog.actions.${l.action}`, { defaultValue: l.action }),
    },
    {
      id: 'target',
      label: t('auditLog.target'),
      render: (l) => l.target_label || l.target_id || '—',
    },
    { id: 'summary', label: t('auditLog.summary'), render: (l) => l.summary || '—' },
  ];
}

export function ActivityLogView() {
  const { t } = useTranslate('usage');
  const columns = useColumns();
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);
  const load = useCallback(
    () => adminListAuditLogs({ page: page + 1, limit: PAGE_SIZE, action }),
    [page, action]
  );
  const { data, error, loading, updatedAt } = useFetch(load);

  const filter = (value: string) => {
    setAction(value);
    setPage(0);
  };

  return (
    <PageShell
      title={t('auditLog.title')}
      action={<ActionFilter value={action} onChange={filter} />}
      loading={loading}
      error={error}
      updatedAt={updatedAt}
    >
      <Card>
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          rowKey={(l) => l.id}
          emptyMessage={t('auditLog.empty')}
        />
        <TablePagination
          component="div"
          count={data?.pagination.total ?? 0}
          page={page}
          rowsPerPage={PAGE_SIZE}
          rowsPerPageOptions={[PAGE_SIZE]}
          onPageChange={(_, next) => setPage(next)}
          labelDisplayedRows={({ from, to, count }) => t('auditLog.rows', { from, to, count })}
        />
      </Card>
    </PageShell>
  );
}
