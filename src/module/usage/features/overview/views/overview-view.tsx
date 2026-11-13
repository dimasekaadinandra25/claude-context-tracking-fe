import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

import { useOverview } from '../hooks/use-overview';
import { KpiRow } from '../../../components/kpi-row';
import { BudgetCard } from '../components/budget-card';
import { PeopleTable } from '../components/people-table';
import { PageShell } from '../../../components/page-shell';
import { ChartCard } from '../../../components/chart-card';
import { RangePicker } from '../../../components/range-picker';
import { ActivityHeatmap } from '../components/activity-heatmap';
import { PlanUsageCard } from '../../../components/plan-usage-card';
import { StackedBarChart } from '../../../components/stacked-bar-chart';
import { ContextPressureCard } from '../components/context-pressure-card';
import { ExportImageButton } from '../../../components/export-image-button';
import { RangeActivityCard } from '../../../components/range-activity-card';

export function OverviewView() {
  const { t } = useTranslate('usage');
  const { overview, points, previous, hourly, trends, nameOf, error, loading, updatedAt } =
    useOverview();

  return (
    <PageShell
      title={t('overview.title')}
      action={
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {updatedAt && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('overview.updated', { time: dayjs(updatedAt).format('HH:mm') })}
            </Typography>
          )}
          <RangePicker quick />
        </Stack>
      }
      loading={loading}
      error={error}
    >
      {overview && (
        <>
          <KpiRow overview={overview} previous={previous} />
          <PlanUsageCard
            people={overview.people}
            action={<ExportImageButton people={overview.people} />}
          />
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
