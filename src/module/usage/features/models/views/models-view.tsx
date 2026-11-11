import type { ModelUsage } from '../../../types';
import type { Column } from '../../../components/data-table';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { PieChart } from '@mui/x-charts/PieChart';
import useMediaQuery from '@mui/material/useMediaQuery';

import { useTranslate } from 'src/locales';

import { useModels } from '../hooks/use-models';
import { formatTokens } from '../../../utils/format';
import { PageShell } from '../../../components/page-shell';
import { DataTable } from '../../../components/data-table';
import { ChartCard } from '../../../components/chart-card';
import { EmptyState } from '../../../components/empty-state';
import { RangePicker } from '../../../components/range-picker';
import { MemberModelsCard } from '../components/member-models-card';
import { StackedBarChart } from '../../../components/stacked-bar-chart';

const DONUT_HEIGHT = 320;
const DONUT_INNER = 70;

function ModelDonut({ models }: { models: ModelUsage[] }) {
  const theme = useTheme();
  const legendBelow = useMediaQuery(theme.breakpoints.down('lg'));
  const { t } = useTranslate('usage');
  const data = models.filter((m) => m.new_context > 0);

  if (data.length === 0) {
    return <EmptyState message={t('empty.models')} />;
  }

  return (
    <PieChart
      height={DONUT_HEIGHT}
      slotProps={
        legendBelow
          ? {
              legend: {
                direction: 'horizontal',
                position: { vertical: 'bottom', horizontal: 'center' },
              },
            }
          : undefined
      }
      series={[
        {
          innerRadius: DONUT_INNER,
          data: data.map((m) => ({ id: m.model, label: m.model, value: m.new_context })),
          valueFormatter: (item) => formatTokens(item.value),
        },
      ]}
    />
  );
}

function ModelsTable({ models }: { models: ModelUsage[] }) {
  const { t } = useTranslate('usage');
  const columns: Column<ModelUsage>[] = [
    { id: 'model', label: t('col.model'), render: (m) => m.model },
    {
      id: 'newContext',
      label: t('col.newContext'),
      align: 'right',
      render: (m) => formatTokens(m.new_context),
    },
    {
      id: 'requests',
      label: t('col.requests'),
      align: 'right',
      render: (m) => m.requests.toLocaleString(),
    },
    {
      id: 'outputTokens',
      label: t('col.outputTokens'),
      align: 'right',
      render: (m) => formatTokens(m.output_tokens),
    },
    {
      id: 'subagentRequests',
      label: t('col.subagentRequests'),
      align: 'right',
      render: (m) => m.subagent_requests.toLocaleString(),
    },
    {
      id: 'subagentOutput',
      label: t('col.subagentOutput'),
      align: 'right',
      render: (m) => formatTokens(m.subagent_output_tokens),
    },
    { id: 'sessions', label: t('col.sessions'), align: 'right', render: (m) => m.sessions },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        rows={models}
        rowKey={(m) => m.model}
        emptyMessage={t('empty.models')}
      />
    </Card>
  );
}

export function ModelsView() {
  const { t } = useTranslate('usage');
  const { models, points, members, error, loading } = useModels();

  return (
    <PageShell title={t('models.title')} action={<RangePicker />} loading={loading} error={error}>
      {models && (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <ChartCard title={t('models.share')}>
                <ModelDonut models={models} />
              </ChartCard>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <ChartCard title={t('models.chart')}>
                <StackedBarChart points={points} />
              </ChartCard>
            </Grid>
          </Grid>
          <MemberModelsCard rows={members} />
          <ModelsTable models={models} />
        </>
      )}
    </PageShell>
  );
}
