import type { Theme, SxProps } from '@mui/material/styles';
import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useTranslate } from 'src/locales';
import { fToNow } from 'src/shared/utils/format-time';
import { ChartCard } from 'src/module/usage/components/chart-card';

const WARNING_PERCENT = 80;
const ERROR_PERCENT = 90;

type Color = 'primary' | 'warning' | 'error';

export function limitColor(percent: number): Color {
  if (percent >= ERROR_PERCENT) return 'error';
  if (percent >= WARNING_PERCENT) return 'warning';
  return 'primary';
}

function textSx(color: Color): SxProps<Theme> {
  if (color === 'primary') return { color: 'text.primary' };
  return (theme) => ({
    color: theme.vars.palette[color].dark,
    ...theme.applyStyles('dark', { color: theme.vars.palette[color].main }),
  });
}

function useLimitHint() {
  const { t } = useTranslate('usage');
  return (resetsAt: string | null, capturedAt: string | null) =>
    [
      resetsAt && t('limits.resets', { when: dayjs(resetsAt).fromNow() }),
      capturedAt && t('limits.reported', { ago: fToNow(capturedAt) }),
    ]
      .filter(Boolean)
      .join(' · ');
}

export function LimitCell({
  used,
  resetsAt,
  capturedAt,
}: {
  used: number | null;
  resetsAt: string | null;
  capturedAt: string | null;
}) {
  const hint = useLimitHint();
  if (used === null) return '—';
  return (
    <Tooltip title={hint(resetsAt, capturedAt)}>
      <Typography variant="body2" component="span" sx={textSx(limitColor(used))}>
        {Math.round(used)}%
      </Typography>
    </Tooltip>
  );
}

function LimitRow({
  label,
  used,
  resetsAt,
  capturedAt,
}: {
  label: string;
  used: number;
  resetsAt: string | null;
  capturedAt: string | null;
}) {
  const { t } = useTranslate('usage');
  const hint = useLimitHint();
  const color = limitColor(used);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={textSx(color)}>
          {t('limits.used', { percent: Math.round(used) })}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {hint(resetsAt, capturedAt)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        color={color}
        value={Math.min(used, 100)}
        aria-label={label}
        sx={{ height: 8 }}
      />
    </Box>
  );
}

export function PlanLimitsCard({ person }: { person: OverviewPerson }) {
  const { t } = useTranslate('usage');
  const { five_hour_used: five, seven_day_used: seven, limits_captured_at: capturedAt } = person;

  if (five === null && seven === null) return null;

  return (
    <ChartCard title={t('limits.title')}>
      <Stack spacing={2.5}>
        {five !== null && (
          <LimitRow
            label={t('limits.fiveHour')}
            used={five}
            resetsAt={person.five_hour_resets_at}
            capturedAt={capturedAt}
          />
        )}
        {seven !== null && (
          <LimitRow
            label={t('limits.sevenDay')}
            used={seven}
            resetsAt={person.seven_day_resets_at}
            capturedAt={capturedAt}
          />
        )}
      </Stack>
    </ChartCard>
  );
}
