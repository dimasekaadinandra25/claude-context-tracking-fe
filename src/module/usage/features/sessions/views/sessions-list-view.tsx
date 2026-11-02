import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

import { formatDateTime } from '../../../utils/format';
import { SessionsGrid } from '../components/sessions-grid';
import { PageShell } from '../../../components/page-shell';
import { useSessionsList } from '../hooks/use-sessions-list';
import { SessionFilters } from '../components/session-filters';
import { RangePicker } from '../../../components/range-picker';

export function SessionsListView() {
  const { t } = useTranslate('usage');
  const { user } = useAuthContext();
  const list = useSessionsList();

  return (
    <PageShell title={t('sessions.title')} action={<RangePicker />} error={list.error}>
      <Card>
        <Stack spacing={2} sx={{ p: 2 }}>
          {list.hourFilter && (
            <Alert
              severity="info"
              action={
                <Button color="inherit" size="small" onClick={list.clearHourFilter}>
                  {t('sessions.clearHourFilter')}
                </Button>
              }
            >
              {t('sessions.hourFilter', {
                from: formatDateTime(list.hourFilter.from),
                to: formatDateTime(list.hourFilter.to),
              })}
            </Alert>
          )}
          <SessionFilters
            filters={list.filters}
            models={list.models}
            isAdmin={!!user?.is_super_admin}
            onChange={list.setFilter}
          />
          <SessionsGrid {...list} />
        </Stack>
      </Card>
    </PageShell>
  );
}
