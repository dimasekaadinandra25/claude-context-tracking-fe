import type { Overview } from '../types';

import Grid from '@mui/material/Grid';

import { useTranslate } from 'src/locales';

import { KpiTile } from './kpi-tile';
import { formatTokens } from '../utils/format';

type Props = {
  overview: Overview;
  showPeople?: boolean;
};

export function KpiRow({ overview, showPeople = true }: Props) {
  const { t } = useTranslate('usage');

  const tiles = [
    { key: 'newContext', value: formatTokens(overview.total_new_context) },
    { key: 'outputTokens', value: formatTokens(overview.total_output_tokens) },
    { key: 'requests', value: overview.total_requests.toLocaleString() },
    { key: 'subagentRequests', value: overview.total_subagent_requests.toLocaleString() },
    { key: 'sessions', value: overview.total_sessions.toLocaleString() },
    ...(showPeople ? [{ key: 'activePeople', value: String(overview.active_people) }] : []),
  ];

  return (
    <Grid container spacing={3}>
      {tiles.map((tile) => (
        <Grid key={tile.key} size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiTile title={t(`kpi.${tile.key}`)} value={tile.value} />
        </Grid>
      ))}
    </Grid>
  );
}
