import type { UserRow } from './users-table';

import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';
import { ConfirmDialog } from 'src/shared/ui/confirm-dialog';

import { FormDialog } from './form-dialog';
import {
  adminSetActive,
  adminSetBudget,
  adminDeleteBudget,
  adminResetPassword,
} from '../../../api/usage';

export const PASSWORD_MIN = 8;

export type UserDialogProps = {
  open: boolean;
  user: UserRow | null;
  busy: boolean;
  onClose: () => void;
  onRun: (run: () => Promise<unknown>, success: string) => void;
};

export const displayName = (user: UserRow | null) => user?.full_name || user?.username || '';

export function ResetPasswordDialog({ open, user, busy, onClose, onRun }: UserDialogProps) {
  const { t } = useTranslate('usage');

  return (
    <FormDialog
      open={open}
      title={t('admin.resetTitle', { name: displayName(user) })}
      submitLabel={t('admin.resetPassword')}
      fields={[
        {
          name: 'password',
          label: t('admin.newPassword'),
          type: 'password',
          required: true,
          minLength: PASSWORD_MIN,
        },
      ]}
      busy={busy}
      onClose={onClose}
      onSubmit={(v) =>
        onRun(() => adminResetPassword(user?.id ?? '', v.password ?? ''), t('admin.passwordReset'))
      }
    />
  );
}

export function ToggleActiveDialog({ open, user, busy, onClose, onRun }: UserDialogProps) {
  const { t } = useTranslate('usage');
  const active = !!user?.is_active;
  const label = active ? t('admin.deactivate') : t('admin.activate');

  return (
    <ConfirmDialog
      open={open}
      title={label}
      description={t(active ? 'admin.deactivateConfirm' : 'admin.activateConfirm', {
        name: displayName(user),
      })}
      confirmLabel={label}
      confirmColor={active ? 'error' : 'success'}
      loading={busy}
      onClose={onClose}
      onConfirm={() => onRun(() => adminSetActive(user?.id ?? '', !active), t('admin.updated'))}
    />
  );
}

export function BudgetDialog({ open, user, busy, onClose, onRun }: UserDialogProps) {
  const { t } = useTranslate('usage');
  const id = user?.id ?? '';

  return (
    <FormDialog
      open={open}
      title={t('budget.dialogTitle', { name: displayName(user) })}
      submitLabel={t('budget.save')}
      fields={[
        {
          name: 'monthly_new_context',
          label: t('budget.tokens'),
          type: 'number',
          required: true,
          min: 1,
          step: 1,
        },
      ]}
      busy={busy}
      secondaryAction={
        user?.monthly_new_context ? (
          <Button
            color="error"
            disabled={busy}
            onClick={() => onRun(() => adminDeleteBudget(id), t('budget.cleared'))}
          >
            {t('budget.clear')}
          </Button>
        ) : null
      }
      onClose={onClose}
      onSubmit={(v) =>
        onRun(() => adminSetBudget(id, Number(v.monthly_new_context)), t('budget.saved'))
      }
    />
  );
}
