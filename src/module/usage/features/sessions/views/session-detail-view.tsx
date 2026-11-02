import type { OutputUsage, SessionDetail, TimeseriesPoint } from '../../../types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { getSession } from '../../../api/usage';
import { useFetch } from '../../../hooks/use-fetch';
import { toStackedSeries } from '../../../utils/series';
import { PageShell } from '../../../components/page-shell';
import { ChartCard } from '../../../components/chart-card';
import { EmptyState } from '../../../components/empty-state';
import { formatTokens, formatBucket, formatDateTime } from '../../../utils/format';

const CHART_HEIGHT = 320;
const Y_AXIS_WIDTH = 56;

const valueFormatter = (value: number | null) => formatTokens(value ?? 0);

const sum = (detail: SessionDetail, field: keyof OutputUsage) =>
  detail.hours.reduce((total, h) => total + h[field], 0);

function facts(detail: SessionDetail): [string, string][] {
  const s = detail.session;
  return [
    ['person', detail.user_name],
    ['project', s.project || '-'],
    ['model', s.model],
    ['models', detail.models.join(', ')],
    ['machine', s.machine],
    ['contextWindow', formatTokens(s.context_window)],
    ['startContext', formatTokens(s.start_context)],
    ['latestPeak', `${formatTokens(s.latest_context)} / ${formatTokens(s.peak_context)}`],
    ['newContext', formatTokens(s.new_context)],
    ['requests', s.requests.toLocaleString()],
    ['outputTokens', formatTokens(sum(detail, 'output_tokens'))],
    ['subagentRequests', sum(detail, 'subagent_requests').toLocaleString()],
    ['subagentOutput', formatTokens(sum(detail, 'subagent_output_tokens'))],
    ['compactions', String(s.compactions)],
    ['firstRequest', formatDateTime(s.first_request_at)],
    ['lastRequest', formatDateTime(s.last_request_at)],
  ];
}

function Facts({ detail }: { detail: SessionDetail }) {
  const { t } = useTranslate('usage');
  return (
    <Card sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        }}
      >
        {facts(detail).map(([key, value]) => (
          <Box key={key}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t(`fact.${key}`)}
            </Typography>
            <Typography variant="subtitle2" sx={{ wordBreak: 'break-all' }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

function HourlyLineChart({ points }: { points: TimeseriesPoint[] }) {
  const { t } = useTranslate('usage');

  if (points.length === 0) {
    return <EmptyState message={t('empty.chart')} />;
  }

  const { buckets, series } = toStackedSeries(points);

  return (
    <LineChart
      height={CHART_HEIGHT}
      xAxis={[{ scaleType: 'point', data: buckets.map((b) => formatBucket(b, 'hour')) }]}
      yAxis={[{ width: Y_AXIS_WIDTH, valueFormatter: (value: number) => formatTokens(value) }]}
      series={series.map((s) => ({ ...s, valueFormatter, showMark: false }))}
    />
  );
}

export function SessionDetailView() {
  const { t } = useTranslate('usage');
  const { id = '' } = useParams();
  const load = useCallback(() => getSession(id), [id]);
  const { data, error, loading } = useFetch(load);
  const points = (data?.hours ?? []).map((h) => ({ ...h, bucket: h.hour, key: h.model }));

  return (
    <PageShell
      title={data?.session.title || t('session.title')}
      backHref={paths.dashboard.sessions}
      loading={loading}
      error={error}
    >
      {data && (
        <>
          <Facts detail={data} />
          <ChartCard title={t('session.lineChart')}>
            <HourlyLineChart points={points} />
          </ChartCard>
        </>
      )}
    </PageShell>
  );
}
