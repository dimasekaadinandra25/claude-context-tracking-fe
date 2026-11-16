import type { TFunction } from 'i18next';
import type { Column } from '../../../components/data-table';
import type { SmallOpusSession } from '../../../utils/model-mix';

import { useCallback } from 'react';

import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { getSessions } from '../../../api/usage';
import { useFetch } from '../../../hooks/use-fetch';
import { formatTokens } from '../../../utils/format';
import { sessionTitle } from '../../../utils/session';
import { RowLink } from '../../../components/row-link';
import { PERCENT, formatUsd } from '../../../utils/plan';
import { DataTable } from '../../../components/data-table';
import { ChartCard } from '../../../components/chart-card';
import { useReportRange } from '../../../hooks/use-report-range';
import { modelMixTip, SMALL_OUTPUT, SMALL_REQUESTS } from '../../../utils/model-mix';

const PER_PAGE = '100';
const TOP = 5;

const mixColumns = (t: TFunction): Column<SmallOpusSession>[] => [
  {
    id: 'session',
    label: t('col.title'),
    render: ({ session }) => (
      <RowLink href={paths.dashboard.session(session.id)}>
        {sessionTitle({ title: session.title || session.project }, t)}
      </RowLink>
    ),
  },
  { id: 'member', label: t('col.person'), render: ({ session }) => session.user_name ?? '—' },
  {
    id: 'requests',
    label: t('col.requests'),
    align: 'right',
    render: ({ session }) => session.requests.toLocaleString(),
  },
  {
    id: 'saving',
    label: t('models.mix.saving'),
    align: 'right',
    render: ({ saving }) => formatUsd(saving),
  },
];

export function ModelMixCard() {
  const { t } = useTranslate('usage');
  const { range } = useReportRange();
  const load = useCallback(() => getSessions(range, { per_page: PER_PAGE }), [range]);
  const tip = modelMixTip(useFetch(load).data?.items ?? []);

  if (tip.sessions.length === 0) return null;

  return (
    <ChartCard title={t('models.mix.title')}>
      <Typography variant="subtitle1">
        {t('models.mix.found', {
          count: tip.sessions.length,
          share: Math.round((tip.sessions.length / tip.opusSessions) * PERCENT),
          requests: SMALL_REQUESTS,
          output: formatTokens(SMALL_OUTPUT),
        })}
      </Typography>
      <Typography variant="body2" sx={{ color: 'success.main', mb: 2 }}>
        {t('models.mix.cheaper', {
          percent: tip.cost > 0 ? Math.round((tip.saving / tip.cost) * PERCENT) : 0,
          saving: formatUsd(tip.saving),
        })}
      </Typography>
      <DataTable
        columns={mixColumns(t)}
        rows={tip.sessions.slice(0, TOP)}
        rowKey={({ session }) => session.id}
        emptyMessage=""
      />
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.disabled' }}>
        {t('models.mix.note')}
      </Typography>
    </ChartCard>
  );
}
