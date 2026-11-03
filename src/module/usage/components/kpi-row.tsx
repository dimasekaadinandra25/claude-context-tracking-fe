import type { Overview } from '../types';

import Grid from '@mui/material/Grid';

import { useTranslate } from 'src/locales';

import { KpiTile } from './kpi-tile';
import { rangeDays } from '../utils/range';
import { percentChange } from '../utils/scale';
import { useReportRange } from '../hooks/use-report-range';
import { cacheHitRate, formatTokens, formatPercent } from '../utils/format';

type Props = {
  overview: Overview;
  previous?: Overview | null;
  showPeople?: boolean;
};

type Total = {
  [K in keyof Overview]: Overview[K] extends number ? K : never;
}[keyof Overview];

const count = (value: number) => value.toLocaleString();

const SIZE = { xs: 6, md: 4 };
const DENSE_SIZE = { ...SIZE, lg: 3 };
const LAST_DENSE_SIZE = { xs: 12, lg: 3 };

const TILES: { key: string; field: Total; format: (value: number) => string }[] = [
  { key: 'newContext', field: 'total_new_context', format: formatTokens },
  { key: 'outputTokens', field: 'total_output_tokens', format: formatTokens },
  { key: 'requests', field: 'total_requests', format: count },
  { key: 'subagentRequests', field: 'total_subagent_requests', format: count },
  { key: 'sessions', field: 'total_sessions', format: count },
  { key: 'activePeople', field: 'active_people', format: String },
];

const overallCacheHitRate = (overview: Overview) =>
  cacheHitRate({
    input_tokens: overview.total_input_tokens,
    cache_write_tokens: overview.total_cache_write_tokens,
    cache_read_tokens: overview.total_cache_read_tokens,
  });

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
  const cacheRate = overallCacheHitRate(overview);
  const size = showPeople ? DENSE_SIZE : SIZE;

  return (
    <Grid container spacing={3}>
      {tiles.map((tile) => (
        <Grid key={tile.key} size={size}>
          <KpiTile
            title={t(`kpi.${tile.key}`)}
            value={tile.format(overview[tile.field])}
            change={previous ? change(overview[tile.field], previous[tile.field]) : undefined}
          />
        </Grid>
      ))}
      <Grid size={showPeople ? LAST_DENSE_SIZE : SIZE}>
        <KpiTile
          title={t('kpi.cacheHitRate')}
          description={t('cache.hint')}
          value={formatPercent(cacheRate)}
          change={
            previous && cacheRate !== null
              ? change(cacheRate, overallCacheHitRate(previous) ?? 0)
              : undefined
          }
        />
      </Grid>
    </Grid>
  );
}
