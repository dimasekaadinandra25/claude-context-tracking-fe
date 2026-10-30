import type { ApiKey } from '../../../types';
import type { UserRow } from './users-table';
import type { Column } from '../../../components/data-table';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { Label } from 'src/shared/ui/label';
import { ErrorDialog } from 'src/shared/ui/error-dialog';
import { ConfirmDialog } from 'src/shared/ui/confirm-dialog';

import { FormDialog } from './form-dialog';
import { useKeys } from '../hooks/use-keys';
import { displayName } from './user-dialogs';
import { IssuedKeyDialog } from './issued-key-dialog';
import { formatDateTime } from '../../../utils/format';
import { DataTable } from '../../../components/data-table';

const DRAWER_WIDTH = 720;
const KEY_NAME_MAX = 100;

type Props = {
  user: UserRow | null;
  onClose: () => void;
};

function useKeyColumns(onRevoke: (key: ApiKey) => void): Column<ApiKey>[] {
  const { t } = useTranslate('usage');
  return [
    { id: 'name', label: t('col.name'), render: (k) => k.name },
    { id: 'prefix', label: t('col.prefix'), render: (k) => <code>{k.key_prefix}</code> },
    { id: 'created', label: t('col.created'), render: (k) => formatDateTime(k.created_at) },
    { id: 'lastUsed', label: t('col.lastUsed'), render: (k) => formatDateTime(k.last_used_at) },
    {
      id: 'status',
      label: t('col.status'),
      render: (k) => (
        <Label color={k.is_active ? 'success' : 'error'}>
          {k.is_active ? t('status.active') : t('status.revoked')}
        </Label>
      ),
    },
    {
      id: 'revoke',
      align: 'right',
      render: (k) =>
        k.is_active && (
          <Button size="small" color="error" onClick={() => onRevoke(k)}>
            {t('keys.revoke')}
          </Button>
        ),
    },
  ];
}

export function KeysDrawer({ user, onClose }: Props) {
  const { t } = useTranslate('usage');
  const { t: tCommon } = useTranslate('common');
  const keys = useKeys(user?.id ?? '');
  const columns = useKeyColumns(keys.setRevoking);

  return (
    <Drawer anchor="right" open={!!user} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', md: DRAWER_WIDTH }, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t('keys.title', { name: displayName(user) })}
          </Typography>
          <Button variant="contained" onClick={() => keys.setIssuing(true)}>
            {t('keys.issue')}
          </Button>
          <Button color="inherit" onClick={onClose}>
            {tCommon('actions.close')}
          </Button>
        </Box>
        {keys.error && <Alert severity="error">{keys.error}</Alert>}
        <DataTable
          columns={columns}
          rows={keys.keys}
          rowKey={(k) => k.id}
          emptyMessage={t('empty.keys')}
        />
      </Box>
      <FormDialog
        open={keys.issuing}
        title={t('keys.issue')}
        submitLabel={t('keys.issueSubmit')}
        fields={[{ name: 'name', label: t('keys.name'), required: true, maxLength: KEY_NAME_MAX }]}
        busy={keys.action.busy}
        onClose={() => keys.setIssuing(false)}
        onSubmit={keys.issue}
      />
      <IssuedKeyDialog issuedKey={keys.issuedKey} onClose={keys.clearIssuedKey} />
      <ConfirmDialog
        open={!!keys.revoking}
        title={t('keys.revokeTitle')}
        description={t('keys.revokeConfirm', { prefix: keys.revoking?.key_prefix ?? '' })}
        confirmLabel={t('keys.revoke')}
        confirmColor="error"
        loading={keys.action.busy}
        onClose={() => keys.setRevoking(null)}
        onConfirm={keys.revoke}
      />
      <ErrorDialog
        open={!!keys.action.error}
        message={keys.action.error ?? ''}
        onClose={keys.action.clearError}
      />
    </Drawer>
  );
}
