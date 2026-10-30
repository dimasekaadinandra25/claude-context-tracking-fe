import Card from '@mui/material/Card';

import { useTranslate } from 'src/locales';

import { useOverview } from '../hooks/use-overview';
import { KpiRow } from '../../../components/kpi-row';
import { PeopleTable } from '../components/people-table';
import { PageShell } from '../../../components/page-shell';
import { ChartCard } from '../../../components/chart-card';
import { RangePicker } from '../../../components/range-picker';
import { StackedBarChart } from '../../../components/stacked-bar-chart';

export function OverviewView() {
  const { t } = useTranslate('usage');
  const { overview, points, nameOf, error, loading } = useOverview();

  return (
    <PageShell title={t('overview.title')} action={<RangePicker />} loading={loading} error={error}>
      {overview && (
        <>
          <KpiRow overview={overview} />
          <ChartCard title={t('overview.chart')}>
            <StackedBarChart points={points} interval="day" labelOf={nameOf} />
          </ChartCard>
          <Card>
            <PeopleTable people={overview.people} />
          </Card>
        </>
      )}
    </PageShell>
  );
}
