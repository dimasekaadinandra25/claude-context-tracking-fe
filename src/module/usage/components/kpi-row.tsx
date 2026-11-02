import type { Overview } from '../types';

import Grid from '@mui/material/Grid';

import { useTranslate } from 'src/locales';

import { KpiTile } from './kpi-tile';
import { rangeDays } from '../utils/range';
import { formatTokens } from '../utils/format';
import { percentChange } from '../utils/scale';
import { useReportRange } from '../hooks/use-report-range';

type Props = {
  overview: Overview;
  previous?: Overview | null;
  showPeople?: boolean;
};

type Total = {
  [K in keyof Overview]: Overview[K] extends number ? K : never;
}[keyof Overview];

const count = (value: number) => value.toLocaleString();

const TILES: { key: string; field: Total; format: (value: number) => string }[] = [
  { key: 'newContext', field: 'total_new_context', format: formatTokens },
  { key: 'outputTokens', field: 'total_output_tokens', format: formatTokens },
  { key: 'requests', field: 'total_requests', format: count },
  { key: 'subagentRequests', field: 'total_subagent_requests', format: count },
  { key: 'sessions', field: 'total_sessions', format: count },
  { key: 'activePeople', field: 'active_people', format: String },
];

function useChange() {
  const { t } = useTranslate('usage');
  const { range } = useReportRange();
  const days = rangeDays(range);

  return (current: number, previous: number) => {
    const percent = percentChange(current, previous);
    if (percent === null) return t('kpi.noPrevious');
    if (percent > 0) return t('kpi.up', { percent, days });
    if (percent < 0) return t('kpi.down', { percent: -percent, days });
    return t('kpi.flat', { days });
  };
}

export function KpiRow({ overview, previous, showPeople = true }: Props) {
  const { t } = useTranslate('usage');
  const change = useChange();
  const tiles = showPeople ? TILES : TILES.filter((tile) => tile.key !== 'activePeople');

  return (
    <Grid container spacing={3}>
      {tiles.map((tile) => (
        <Grid key={tile.key} size={{ xs: 12, sm: 6, md: 4 }}>
          <KpiTile
            title={t(`kpi.${tile.key}`)}
            value={tile.format(overview[tile.field])}
            change={previous ? change(overview[tile.field], previous[tile.field]) : undefined}
          />
        </Grid>
      ))}
    </Grid>
  );
}
