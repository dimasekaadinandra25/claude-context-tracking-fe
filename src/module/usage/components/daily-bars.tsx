import type { DailyUsage } from 'src/module/usage/types';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { PERCENT, PACE_PERCENT } from 'src/module/usage/utils/plan';

const FONT_WEIGHT_TODAY = 700;
const FONT_WEIGHT_DEFAULT = 400;
const DATE_FORMAT = 'YYYY-MM-DD';
const CHART_HEIGHT = 140;
const CHART_HEADROOM = 1.3;

export function DailyBars({
  days,
  rows,
  title = true,
}: {
  days: string[];
  rows: DailyUsage[];
  title?: boolean;
}) {
  const { t } = useTranslate('usage');
  const byDay = new Map(rows.map((row) => [row.day, row]));
  const top = Math.max(PACE_PERCENT, ...rows.map((row) => row.limit_used ?? 0)) * CHART_HEADROOM;
  const columns = { display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: 1 };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {title && t('limits.daily')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {t('limits.pace', { percent: PACE_PERCENT.toFixed(1) })}
        </Typography>
      </Box>
      <BarColumns days={days} byDay={byDay} top={top} columns={columns} />
      <DayLabels days={days} byDay={byDay} columns={columns} />
    </Box>
  );
}

type ByDay = Map<string, DailyUsage>;

function BarColumns({
  days,
  byDay,
  top,
  columns,
}: {
  days: string[];
  byDay: ByDay;
  top: number;
  columns: object;
}) {
  return (
    <Box
      sx={{
        ...columns,
        position: 'relative',
        height: CHART_HEIGHT,
        alignItems: 'end',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: `${(PACE_PERCENT / top) * PERCENT}%`,
          borderTop: '1px dashed',
          borderColor: 'text.disabled',
        }}
      />
      {days.map((day) => (
        <Bar key={day} used={byDay.get(day)?.limit_used ?? null} top={top} />
      ))}
    </Box>
  );
}

function Bar({ used, top }: { used: number | null; top: number }) {
  return (
    <Box
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      {used !== null && (
        <>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            +{Math.round(used)}%
          </Typography>
          <Box
            sx={{
              width: '60%',
              maxWidth: 44,
              minHeight: 3,
              height: `${(used / top) * PERCENT}%`,
              bgcolor: 'primary.main',
              borderRadius: '4px 4px 0 0',
            }}
          />
        </>
      )}
    </Box>
  );
}

function DayLabels({ days, byDay, columns }: { days: string[]; byDay: ByDay; columns: object }) {
  const { t } = useTranslate('usage');
  const today = dayjs().format(DATE_FORMAT);

  return (
    <Box sx={{ ...columns, mt: 1 }}>
      {days.map((day) => {
        const reading = byDay.get(day)?.seven_day_used ?? null;
        return (
          <Box key={day} sx={{ textAlign: 'center', minWidth: 0 }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                display: 'block',
                fontWeight: day === today ? FONT_WEIGHT_TODAY : FONT_WEIGHT_DEFAULT,
                color: day > today ? 'text.disabled' : 'text.primary',
              }}
            >
              {dayjs(day).format('ddd D')}
            </Typography>
            {reading !== null && (
              <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                {t('limits.dayLeft', { percent: Math.round(Math.max(0, PERCENT - reading)) })}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
