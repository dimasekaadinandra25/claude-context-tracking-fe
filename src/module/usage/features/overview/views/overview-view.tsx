import Card from '@mui/material/Card';

import { useTranslate } from 'src/locales';

import { useOverview } from '../hooks/use-overview';
import { KpiRow } from '../../../components/kpi-row';
import { BudgetCard } from '../components/budget-card';
import { PeopleTable } from '../components/people-table';
import { PageShell } from '../../../components/page-shell';
import { ChartCard } from '../../../components/chart-card';
import { RangePicker } from '../../../components/range-picker';
import { ActivityHeatmap } from '../components/activity-heatmap';
import { StackedBarChart } from '../../../components/stacked-bar-chart';
import { ContextPressureCard } from '../components/context-pressure-card';
import { RangeActivityCard } from '../../../components/range-activity-card';

export function OverviewView() {
  const { t } = useTranslate('usage');
  const { overview, points, previous, hourly, trends, nameOf, error, loading } = useOverview();

  return (
    <PageShell
      title={t('overview.title')}
      action={<RangePicker quick />}
      loading={loading}
      error={error}
    >
      {overview && (
        <>
          <KpiRow overview={overview} previous={previous} />
          <BudgetCard />
          <ChartCard title={t('overview.chart')}>
            <StackedBarChart points={points} labelOf={nameOf} />
          </ChartCard>
          <ChartCard title={t('overview.heatmap')}>
            <ActivityHeatmap points={hourly} />
          </ChartCard>
          <RangeActivityCard overview={overview} />
          <ContextPressureCard people={overview.people} />
          <Card>
            <PeopleTable people={overview.people} trends={trends} />
          </Card>
        </>
      )}
    </PageShell>
  );
}
