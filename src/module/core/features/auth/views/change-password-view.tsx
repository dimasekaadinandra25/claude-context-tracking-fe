import type { TFunction } from 'i18next';

import * as z from 'zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';
import { toast } from 'src/shared/ui/snackbar';
import { Form, Field } from 'src/shared/ui/hook-form';
import { PageHeader } from 'src/shared/ui/page-header';

import { changePassword } from '../api';
import { useAuthContext } from '../hooks';
import { getErrorMessage } from '../utils';

const PASSWORD_MIN = 8;
const FORM_MAX_WIDTH = 480;

function makeSchema(t: TFunction) {
  return z
    .object({
      current: z.string().min(1, { message: t('validation.currentRequired') }),
      next: z.string().min(PASSWORD_MIN, { message: t('validation.passwordMin') }),
      confirm: z.string(),
    })
    .refine((v) => v.next === v.confirm, {
      message: t('validation.passwordMismatch'),
      path: ['confirm'],
    });
}

type ChangePasswordSchema = z.infer<ReturnType<typeof makeSchema>>;

function useChangePasswordForm() {
  const { t } = useTranslate('auth');
  const router = useRouter();
  const { user, checkUserSession } = useAuthContext();
  const schema = useMemo(() => makeSchema(t), [t]);
  const [error, setError] = useState<string | null>(null);
  const forced = !!user?.must_change_password;

  const methods = useForm<ChangePasswordSchema>({
    resolver: zodResolver(schema),
    defaultValues: { current: '', next: '', confirm: '' },
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      setError(null);
      await changePassword({ current_password: data.current, new_password: data.next });
      toast.success(t('changePassword.success'));
      methods.reset();
      await checkUserSession();
      if (forced) router.replace(paths.dashboard.root);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return { t, methods, onSubmit, error, forced };
}

export function ChangePasswordView() {
  const { t, methods, onSubmit, error, forced } = useChangePasswordForm();
  const password = (name: keyof ChangePasswordSchema, label: string) => (
    <Field.Text name={name} label={label} type="password" />
  );

  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader title={t('changePassword.title')} />
      {forced && <Alert severity="warning">{t('changePassword.notice')}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Card sx={{ p: 3, maxWidth: FORM_MAX_WIDTH }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            {password('current', t('changePassword.fields.current'))}
            {password('next', t('changePassword.fields.new'))}
            {password('confirm', t('changePassword.fields.confirm'))}
            <Button
              type="submit"
              variant="contained"
              loading={methods.formState.isSubmitting}
              loadingIndicator={t('changePassword.submitting')}
            >
              {t('changePassword.submit')}
            </Button>
          </Stack>
        </Form>
      </Card>
    </Stack>
  );
}
