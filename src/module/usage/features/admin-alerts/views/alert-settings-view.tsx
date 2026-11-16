import type { AlertForm } from '../utils/alerts';
import type { AlertSettings } from '../../../types';

import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';
import { ErrorDialog } from 'src/shared/ui/error-dialog';

import { useFetch } from '../../../hooks/use-fetch';
import { PageShell } from '../../../components/page-shell';
import { useAdminAction } from '../../admin-people/hooks/use-admin-people';
import { getAlertSettings, adminSaveAlertSettings } from '../../../api/usage';
import { WordsCard, SharesCard, ThresholdsCard } from '../components/alert-cards';
import { DEFAULT_SETTINGS, formFromSettings, settingsFromForm } from '../utils/alerts';

function AlertSettingsForm({ initial }: { initial: AlertSettings | null }) {
  const { t } = useTranslate('usage');
  const action = useAdminAction();
  const [form, setForm] = useState<AlertForm>(() => formFromSettings(initial ?? DEFAULT_SETTINGS));
  const [stored, setStored] = useState(initial !== null);
  const settings = settingsFromForm(form);
  const change = (patch: Partial<AlertForm>) => setForm((prev) => ({ ...prev, ...patch }));

  const save = async () => {
    if (!settings) return;
    const ok = await action.run(async () => {
      setForm(formFromSettings(await adminSaveAlertSettings(settings)));
    }, t('alertSettings.saved'));
    if (ok) setStored(true);
  };

  return (
    <Stack spacing={3}>
      {!stored && <Alert severity="info">{t('alertSettings.notSaved')}</Alert>}
      <ThresholdsCard form={form} onChange={change} />
      <WordsCard form={form} onChange={change} />
      <SharesCard form={form} onChange={change} />
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
        <Button onClick={() => setForm(formFromSettings(DEFAULT_SETTINGS))}>
          {t('alertSettings.reset')}
        </Button>
        <Button variant="contained" disabled={!settings} loading={action.busy} onClick={save}>
          {t('alertSettings.save')}
        </Button>
      </Stack>
      <ErrorDialog open={!!action.error} message={action.error ?? ''} onClose={action.clearError} />
    </Stack>
  );
}

export function AlertSettingsView() {
  const { t } = useTranslate('usage');
  const { data, error, loading } = useFetch(getAlertSettings, false);

  return (
    <PageShell title={t('alertSettings.title')} loading={loading} error={error}>
      {!loading && !error && <AlertSettingsForm initial={data} />}
    </PageShell>
  );
}
