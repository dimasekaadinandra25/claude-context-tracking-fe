import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';

import { useTranslate } from 'src/locales';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

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
