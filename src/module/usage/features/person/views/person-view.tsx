import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';

import { usePerson } from '../hooks/use-person';
import { KpiRow } from '../../../components/kpi-row';
import { PersonPicker } from '../components/person-picker';
import { PageShell } from '../../../components/page-shell';
import { ChartCard } from '../../../components/chart-card';
import { RangePicker } from '../../../components/range-picker';
import { BudgetCard } from '../../overview/components/budget-card';
import { StackedBarChart } from '../../../components/stacked-bar-chart';
import { RecentSessionsTable } from '../../../components/recent-sessions-table';
import { PersonPressureCard } from '../../overview/components/context-pressure-card';

export function PersonView() {
  const { t } = useTranslate('usage');
  const { isAdmin, userId, overview, previous, person, points, sessions, error, loading } =
    usePerson();

  const action = (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {isAdmin && <PersonPicker userId={userId} />}
      <RangePicker quick />
    </Box>
  );

  const viewAll = (
    <Button component={RouterLink} href={`${paths.dashboard.sessions}?user_id=${userId}`}>
      {t('person.viewAll')}
    </Button>
  );

  return (
    <PageShell
      title={person?.full_name || t('person.title')}
      action={action}
      loading={loading}
      error={error}
    >
      {overview && (
        <>
          <KpiRow overview={overview} previous={previous} showPeople={false} />
          <BudgetCard userId={userId} />
          {person && <PersonPressureCard person={person} />}
          <ChartCard title={t('person.chart')}>
            <StackedBarChart points={points} />
          </ChartCard>
          <Card>
            <CardHeader title={t('person.recent')} action={viewAll} sx={{ pb: 2 }} />
            <RecentSessionsTable sessions={sessions} />
          </Card>
        </>
      )}
    </PageShell>
  );
}
