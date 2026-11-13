import type { Theme, SxProps } from '@mui/material/styles';
import type { DailyUsage, OverviewPerson } from 'src/module/usage/types';

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
  PACE_PERCENT,
  weeklyAllowance,
} from 'src/module/usage/utils/plan';

const WARNING_PERCENT = 80;
const ERROR_PERCENT = 90;
const DATE_FORMAT = 'YYYY-MM-DD';
const CHART_HEIGHT = 140;
const CHART_HEADROOM = 1.3;

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
    .join(' · ');

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
        {elapsed !== undefined && (
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
        )}
      </Box>
    </Box>
  );
}

export function Allowance({ used, tier }: { used: number; tier: string | null }) {
  const { t } = useTranslate('usage');
  const price = planPrice(tier);
  if (price === null) return null;
  const weekly = weeklyAllowance(price);
  const left = Math.max(0, PERCENT - used);

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
      ].join(' · ')}
    </Typography>
  );
}

export function BudgetLine({ used, resetsAt }: { used: number; resetsAt: string }) {
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
  return (
    <Typography
      variant="body2"
      sx={{ color: budget.runsOutAt !== null ? 'warning.main' : 'text.secondary' }}
    >
      {parts.join(' · ')}
    </Typography>
  );
}

function DailyLimitChart({ userId, resetsAt }: { userId: string; resetsAt: string }) {
  const days = useMemo(() => windowDays(resetsAt), [resetsAt]);
  const load = useCallback(() => getDaily(daysRange(days), userId), [days, userId]);
  const { data } = useFetch(load);
  return <DailyBars days={days} rows={data ?? []} />;
}

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
  const today = dayjs().format(DATE_FORMAT);
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
        {days.map((day) => {
          const used = byDay.get(day)?.limit_used ?? null;
          return (
            <Box
              key={day}
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
        })}
      </Box>
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
                  fontWeight: day === today ? 700 : 400,
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
    </Box>
  );
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
        {seven !== null && <ModelLimitRows person={person} />}
        {seven !== null && <Allowance used={seven} tier={person.claude_tier ?? null} />}
        {seven !== null && sevenResets && <BudgetLine used={seven} resetsAt={sevenResets} />}
        {seven !== null && sevenResets && (
          <DailyLimitChart userId={person.user_id} resetsAt={sevenResets} />
        )}
      </Stack>
    </ChartCard>
  );
}
