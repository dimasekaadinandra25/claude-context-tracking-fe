import type { FormField } from './form-dialog';
import type { UserDialogProps } from './user-dialogs';

import { useTranslate } from 'src/locales';

import { FormDialog } from './form-dialog';
import { PASSWORD_MIN } from './user-dialogs';
import { adminCreateUser } from '../../../api/usage';

const USERNAME_MIN = 3;
const USERNAME_MAX = 100;

export function CreateUserDialog({ open, busy, onClose, onRun }: UserDialogProps) {
  const { t } = useTranslate('usage');

  const fields: FormField[] = [
    { name: 'email', label: t('col.email'), type: 'email', required: true },
    {
      name: 'username',
      label: t('admin.username'),
      required: true,
      minLength: USERNAME_MIN,
      maxLength: USERNAME_MAX,
    },
    { name: 'full_name', label: t('col.name') },
    {
      name: 'password',
      label: t('admin.password'),
      type: 'password',
      required: true,
      minLength: PASSWORD_MIN,
    },
  ];

  return (
    <FormDialog
      open={open}
      title={t('admin.create')}
      submitLabel={t('admin.createSubmit')}
      fields={fields}
      busy={busy}
      onClose={onClose}
      onSubmit={(v) =>
        onRun(
          () =>
            adminCreateUser({
              email: v.email ?? '',
              username: v.username ?? '',
              full_name: v.full_name ?? '',
              password: v.password ?? '',
            }),
          t('admin.created')
        )
      }
    />
  );
}
