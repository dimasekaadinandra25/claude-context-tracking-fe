import type { UserRow, UserAction } from '../components/users-table';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';
import { ErrorDialog } from 'src/shared/ui/error-dialog';

import { KeysDrawer } from '../components/keys-drawer';
import { UsersTable } from '../components/users-table';
import { PageShell } from '../../../components/page-shell';
import { CreateUserDialog } from '../components/create-user-dialog';
import { useAdminAction, useAdminPeople } from '../hooks/use-admin-people';
import { ToggleActiveDialog, ResetPasswordDialog } from '../components/user-dialogs';

export type AdminDialog = { kind: UserAction | 'create'; user: UserRow | null } | null;

export function AdminPeopleView() {
  const { t } = useTranslate('usage');
  const { users, error, loading, reload } = useAdminPeople();
  const action = useAdminAction();
  const [dialog, setDialog] = useState<AdminDialog>(null);
  const close = () => setDialog(null);
  const target = dialog?.user ?? null;

  const finish = async (run: () => Promise<unknown>, success: string) => {
    if (await action.run(run, success)) {
      close();
      reload();
    }
  };

  const dialogProps = { user: target, busy: action.busy, onClose: close, onRun: finish };

  return (
    <PageShell
      title={t('adminPeople.title')}
      action={
        <Button variant="contained" onClick={() => setDialog({ kind: 'create', user: null })}>
          {t('admin.create')}
        </Button>
      }
      loading={loading}
      error={error}
    >
      <Card>
        <UsersTable users={users} onAction={(kind, user) => setDialog({ kind, user })} />
      </Card>
      <CreateUserDialog open={dialog?.kind === 'create'} {...dialogProps} />
      <ResetPasswordDialog open={dialog?.kind === 'reset'} {...dialogProps} />
      <ToggleActiveDialog open={dialog?.kind === 'toggle'} {...dialogProps} />
      <KeysDrawer user={dialog?.kind === 'keys' ? target : null} onClose={close} />
      <ErrorDialog open={!!action.error} message={action.error ?? ''} onClose={action.clearError} />
    </PageShell>
  );
}
