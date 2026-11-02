import type { TimeseriesPoint } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { useState } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useTranslate } from 'src/locales';
import { shareOf } from 'src/module/usage/utils/scale';
import { formatTokens, formatBucket } from 'src/module/usage/utils/format';
import { cellBuckets, toWeekHourGrid } from 'src/module/usage/utils/series';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_LABEL_STEP = 3;
const MIN_WIDTH = 560;

type CellProps = {
  label: string;
  value: number;
  max: number;
  onClick: (anchor: HTMLElement) => void;
};

type Selected = { anchor: HTMLElement; day: number; hour: number; label: string };

const hourSessionsHref = (bucket: string) =>
  `${paths.dashboard.sessions}?${new URLSearchParams({
    from: dayjs(bucket).toISOString(),
    to: dayjs(bucket).add(1, 'hour').toISOString(),
  })}`;

function HeatmapCell({ label, value, max, onClick }: CellProps) {
  return (
    <Tooltip title={label}>
      <Box
        onClick={value ? (event) => onClick(event.currentTarget) : undefined}
        sx={(theme) => ({
          cursor: value ? 'pointer' : 'default',
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

function CellPopover({
  points,
  selected,
  onClose,
}: {
  points: TimeseriesPoint[];
  selected: Selected | null;
  onClose: () => void;
}) {
  const buckets = selected ? cellBuckets(points, selected.day, selected.hour) : [];

  return (
    <Popover open={!!selected} anchorEl={selected?.anchor} onClose={onClose}>
      <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5 }}>
        {selected?.label}
      </Typography>
      <List dense>
        {buckets.map(({ bucket, tokens }) => (
          <ListItemButton key={bucket} component={RouterLink} href={hourSessionsHref(bucket)}>
            <ListItemText primary={formatBucket(bucket, 'hour')} secondary={formatTokens(tokens)} />
          </ListItemButton>
        ))}
      </List>
    </Popover>
  );
}

export function ActivityHeatmap({ points }: { points: TimeseriesPoint[] }) {
  const { t } = useTranslate('usage');
  const [selected, setSelected] = useState<Selected | null>(null);
  const grid = toWeekHourGrid(points);
  const max = Math.max(...grid.flat());
  const cellLabel = (day: number, hour: number, value: number) =>
    t('heatmap.cell', {
      day: t(`heatmap.${DAY_KEYS[day]}`),
      hour: String(hour).padStart(2, '0'),
      tokens: formatTokens(value),
    });

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
              label={cellLabel(day, hour, value)}
              onClick={(anchor) =>
                setSelected({ anchor, day, hour, label: cellLabel(day, hour, value) })
              }
            />
          )),
        ])}
      </Box>
      <CellPopover points={points} selected={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
