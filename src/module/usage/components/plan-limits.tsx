import type { Theme, SxProps } from '@mui/material/styles';
import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useTranslate } from 'src/locales';
import { fToNow } from 'src/shared/utils/format-time';
import { getDaily } from 'src/module/usage/api/usage';
import { useFetch } from 'src/module/usage/hooks/use-fetch';
import { DailyBars } from 'src/module/usage/components/daily-bars';
import { ChartCard } from 'src/module/usage/components/chart-card';
import {
  PERCENT,
  budgetOf,
  formatUsd,
  planLabel,
  planPrice,
  daysRange,
  windowDays,
  oneDecimal,
  weekElapsed,
  weeklyAllowance,
} from 'src/module/usage/utils/plan';

const WARNING_PERCENT = 80;
const ERROR_PERCENT = 90;

const SEPARATOR = ' · ';
const TEXT_SECONDARY = 'text.secondary';

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
      .join(SEPARATOR);
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

export function LimitRow({
  label,
  used,
  resetsAt,
  capturedAt,
  elapsed,
}: {
  label: string;
  used: number;
  resetsAt: string | null;
  capturedAt: string | null;
  elapsed?: number;
}) {
  const { t } = useTranslate('usage');
  const hint = useLimitHint();
  const color = limitColor(used);
  const details = [
    hint(resetsAt, capturedAt),
    elapsed !== undefined && t('limits.elapsed', { percent: Math.round(elapsed) }),
  ]
    .filter(Boolean)
    .join(SEPARATOR);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={textSx(color)}>
          {t('limits.used', { percent: Math.round(used) })}
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
          {details}
        </Typography>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          color={color}
          value={Math.min(used, PERCENT)}
          aria-label={label}
          sx={{ height: 8 }}
        />
        {elapsed !== undefined && <ElapsedMarker elapsed={elapsed} />}
      </Box>
    </Box>
  );
}

function ElapsedMarker({ elapsed }: { elapsed: number }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: -4,
        bottom: -4,
        left: `${elapsed}%`,
        width: 2,
        borderRadius: 1,
        bgcolor: 'text.primary',
      }}
    />
  );
}

export function Allowance({ used, tier }: { used: number; tier: string | null }) {
  const { t } = useTranslate('usage');
  const price = planPrice(tier);
  if (price === null) return null;
  const weekly = weeklyAllowance(price);
  const left = Math.max(0, PERCENT - used);

  return (
    <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
      {[
        t('limits.allowance', { weekly: formatUsd(weekly), monthly: `$${price}` }),
        t('limits.spent', {
          percent: Math.round(used),
          amount: formatUsd((used / PERCENT) * weekly),
        }),
        t('limits.left', {
          percent: Math.round(left),
          amount: formatUsd((left / PERCENT) * weekly),
        }),
      ].join(SEPARATOR)}
    </Typography>
  );
}

export function BudgetLine({
  used,
  resetsAt,
  lastWeek = null,
}: {
  used: number;
  resetsAt: string;
  lastWeek?: { day: string; used: number } | null;
}) {
  const { t } = useTranslate('usage');
  const budget = budgetOf(used, resetsAt);
  if (!budget) return null;
  const parts = [
    t('limits.budget', { percent: oneDecimal(budget.perDay), days: oneDecimal(budget.daysLeft) }),
  ];
  if (budget.runsOutAt !== null) {
    parts.push(t('limits.runsOut', { when: dayjs(budget.runsOutAt).format('ddd D MMM HH:mm') }));
  } else if (budget.projected !== null) {
    parts.push(t('limits.projected', { percent: Math.round(budget.projected) }));
  }
  if (lastWeek) {
    parts.push(
      t('limits.lastWeek', {
        day: dayjs(lastWeek.day).format('ddd D'),
        percent: Math.round(lastWeek.used),
      })
    );
  }
  return (
    <Typography
      variant="body2"
      sx={{ color: budget.runsOutAt !== null ? 'warning.main' : 'text.secondary' }}
    >
      {parts.join(SEPARATOR)}
    </Typography>
  );
}

function DailyLimitChart({ userId, resetsAt }: { userId: string; resetsAt: string }) {
  const days = useMemo(() => windowDays(resetsAt), [resetsAt]);
  const load = useCallback(() => getDaily(daysRange(days), userId), [days, userId]);
  const { data } = useFetch(load);
  return <DailyBars days={days} rows={data ?? []} />;
}

export function PlanBadge({ person }: { person: OverviewPerson }) {
  const label = planLabel({
    claude_plan: person.claude_plan ?? null,
    claude_tier: person.claude_tier ?? null,
  });
  if (!label) return null;
  return <Chip size="small" label={label} />;
}

export function ModelLimitRows({ person }: { person: OverviewPerson }) {
  const { t } = useTranslate('usage');
  return (person.model_limits ?? []).map((limit) => (
    <LimitRow
      key={limit.name}
      label={t('limits.model', { name: limit.name })}
      used={limit.used}
      resetsAt={limit.resets_at}
      capturedAt={person.limits_captured_at}
    />
  ));
}

function WeeklyDetails({ person, seven }: { person: OverviewPerson; seven: number }) {
  const sevenResets = person.seven_day_resets_at;
  return (
    <>
      <ModelLimitRows person={person} />
      <Allowance used={seven} tier={person.claude_tier ?? null} />
      {sevenResets && <BudgetLine used={seven} resetsAt={sevenResets} />}
      {sevenResets && <DailyLimitChart userId={person.user_id} resetsAt={sevenResets} />}
    </>
  );
}

export function PlanLimitsCard({ person }: { person: OverviewPerson }) {
  const { t } = useTranslate('usage');
  const { five_hour_used: five, seven_day_used: seven, limits_captured_at: capturedAt } = person;
  const email = person.claude_email ?? null;
  const sevenResets = person.seven_day_resets_at;

  if (five === null && seven === null && email === null) return null;

  return (
    <ChartCard title={t('limits.title')}>
      <Stack spacing={2.5}>
        {email !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle1">{email}</Typography>
            <PlanBadge person={person} />
          </Box>
        )}
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
            resetsAt={sevenResets}
            capturedAt={capturedAt}
            elapsed={sevenResets ? weekElapsed(sevenResets) : undefined}
          />
        )}
        {seven !== null && <WeeklyDetails person={person} seven={seven} />}
      </Stack>
    </ChartCard>
  );
}
