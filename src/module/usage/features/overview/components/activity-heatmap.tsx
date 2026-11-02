import type { TimeseriesPoint } from 'src/module/usage/types';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { shareOf } from 'src/module/usage/utils/scale';
import { formatTokens } from 'src/module/usage/utils/format';
import { toWeekHourGrid } from 'src/module/usage/utils/series';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_LABEL_STEP = 3;
const MIN_WIDTH = 560;

type CellProps = {
  label: string;
  value: number;
  max: number;
};

function HeatmapCell({ label, value, max }: CellProps) {
  return (
    <Tooltip title={label}>
      <Box
        sx={(theme) => ({
          height: 20,
          borderRadius: 0.5,
          bgcolor: value
            ? varAlpha(theme.vars.palette.primary.mainChannel, shareOf(value, max))
            : 'action.hover',
        })}
      />
    </Tooltip>
  );
}

export function ActivityHeatmap({ points }: { points: TimeseriesPoint[] }) {
  const { t } = useTranslate('usage');
  const grid = toWeekHourGrid(points);
  const max = Math.max(...grid.flat());

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 0.5,
          minWidth: MIN_WIDTH,
          alignItems: 'center',
          gridTemplateColumns: `40px repeat(${HOURS.length}, 1fr)`,
        }}
      >
        <Box />
        {HOURS.map((hour) => (
          <Typography key={hour} variant="caption" sx={{ color: 'text.secondary' }}>
            {hour % HOUR_LABEL_STEP === 0 ? hour : ''}
          </Typography>
        ))}
        {grid.map((row, day) => [
          <Typography key={DAY_KEYS[day]} variant="caption" sx={{ color: 'text.secondary' }}>
            {t(`heatmap.${DAY_KEYS[day]}`)}
          </Typography>,
          ...row.map((value, hour) => (
            <HeatmapCell
              key={`${DAY_KEYS[day]}-${hour}`}
              value={value}
              max={max}
              label={t('heatmap.cell', {
                day: t(`heatmap.${DAY_KEYS[day]}`),
                hour: String(hour).padStart(2, '0'),
                tokens: formatTokens(value),
              })}
            />
          )),
        ])}
      </Box>
    </Box>
  );
}
