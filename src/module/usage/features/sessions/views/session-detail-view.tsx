import type { SessionDetail } from '../../../types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { getSession } from '../../../api/usage';
import { useFetch } from '../../../hooks/use-fetch';
import { PageShell } from '../../../components/page-shell';
import { ChartCard } from '../../../components/chart-card';
import { formatTokens, formatDateTime } from '../../../utils/format';
import { StackedBarChart } from '../../../components/stacked-bar-chart';

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
          <ChartCard title={t('session.chart')}>
            <StackedBarChart points={points} interval="hour" />
          </ChartCard>
        </>
      )}
    </PageShell>
  );
}
