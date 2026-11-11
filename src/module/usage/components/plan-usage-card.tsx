import type { Theme } from '@mui/material/styles';
import type { DailyUsage, OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { useTranslate } from 'src/locales';
import { getDaily } from 'src/module/usage/api/usage';
import { useFetch } from 'src/module/usage/hooks/use-fetch';
import { formatTokens } from 'src/module/usage/utils/format';
import { ChartCard } from 'src/module/usage/components/chart-card';
import { lastDays, rangeDates } from 'src/module/usage/utils/range';
import { PlanBadge } from 'src/module/usage/components/plan-limits';
import { EmptyState } from 'src/module/usage/components/empty-state';
import { useReportRange } from 'src/module/usage/hooks/use-report-range';
import {
  inputOf,
  PERCENT,
  isShared,
  weightOf,
  hasTokens,
  WEEK_DAYS,
  formatUsd,
  memberCost,
  oneDecimal,
  roundToTotal,
} from 'src/module/usage/utils/plan';

const CELL_WIDTH = 76;
const MIN_SHADE = 0.08;
const MAX_SHADE = 0.55;
const SMALLEST_SHARE = 0.1;

const formatShare = (rounded: number, exact: number) =>
  exact > 0 && rounded < SMALLEST_SHARE
    ? `<${oneDecimal(SMALLEST_SHARE)}%`
    : `${oneDecimal(rounded)}%`;

type MemberRow = {
  person: OverviewPerson;
  days: Map<string, DailyUsage>;
  input: number;
  output: number;
  weight: number;
  requests: number;
  cost: number | null;
};

function memberRows(people: OverviewPerson[], daily: DailyUsage[]): MemberRow[] {
  const byUser = new Map<string, DailyUsage[]>();
  daily.forEach((row) => byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), row]));

  return people
    .filter((person) =>
      (byUser.get(person.user_id) ?? []).some((row) => hasTokens(row) || !isShared(row))
    )
    .map((person) => {
      const rows = byUser.get(person.user_id) ?? [];
      const costs = rows
        .map((row) => memberCost(row, person.claude_tier ?? null))
        .filter((cost): cost is number => cost !== null);
      return {
        person,
        days: new Map(rows.map((row) => [row.day, row])),
        input: rows.reduce((total, row) => total + inputOf(row), 0),
        output: rows.reduce((total, row) => total + row.output_tokens, 0),
        weight: rows.reduce((total, row) => total + weightOf(row), 0),
        requests: rows.reduce((total, row) => total + row.requests, 0),
        cost: costs.length > 0 ? costs.reduce((total, cost) => total + cost, 0) : null,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}

function DayCell({ row, tier, max }: { row?: DailyUsage; tier: string | null; max: number }) {
  if (!row || (isShared(row) && !hasTokens(row))) {
    return (
      <TableCell align="center" sx={{ color: 'text.disabled' }}>
        –
      </TableCell>
    );
  }
  const cost = memberCost(row, tier);
  const shade = MIN_SHADE + (MAX_SHADE - MIN_SHADE) * (max > 0 ? inputOf(row) / max : 0);

  return (
    <TableCell
      align="center"
      sx={(theme: Theme) => ({
        px: 0.5,
        width: CELL_WIDTH,
        minWidth: CELL_WIDTH,
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, shade),
        borderRadius: 1,
        border: `3px solid ${theme.vars.palette.background.paper}`,
      })}
    >
      <Typography variant="subtitle2">{formatTokens(inputOf(row))}</Typography>
      <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
        {formatTokens(row.output_tokens)}
      </Typography>
      {row.limit_used !== null && !isShared(row) && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          +{Math.round(row.limit_used)}%
        </Typography>
      )}
      {cost !== null && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          {formatUsd(cost)}
        </Typography>
      )}
    </TableCell>
  );
}

export function UsageGrid({
  people,
  daily,
  days,
}: {
  people: OverviewPerson[];
  daily: DailyUsage[];
  days: string[];
}) {
  const { t } = useTranslate('usage');
  const today = dayjs().format('YYYY-MM-DD');
  const rows = memberRows(people, daily);
  const teamWeight = rows.reduce((total, row) => total + row.weight, 0);
  const shares = roundToTotal(
    rows.map((row) => row.weight),
    PERCENT
  );
  const max = Math.max(0, ...daily.map(inputOf));
  const unused = people
    .filter(
      (person) => person.is_active && !rows.some((row) => row.person.user_id === person.user_id)
    )
    .map((person) => person.full_name || person.email);

  if (rows.length === 0) return <EmptyState message={t('planUsage.empty')} />;

  return (
    <>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 960, '& td, & th': { borderBottom: 'none' } }}>
          <TableHead>
            <TableRow>
              <TableCell>{t('planUsage.member')}</TableCell>
              {days.map((day) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    width: CELL_WIDTH,
                    minWidth: CELL_WIDTH,
                    whiteSpace: 'nowrap',
                    fontWeight: day === today ? 700 : 400,
                  }}
                >
                  {dayjs(day).format('ddd D')}
                </TableCell>
              ))}
              <TableCell align="right">{t('planUsage.total')}</TableCell>
              <TableCell align="right">{t('planUsage.share')}</TableCell>
              <TableCell align="right">{t('planUsage.cost')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const share = teamWeight > 0 ? (row.weight / teamWeight) * PERCENT : 0;
              const shown = shares[index];
              const { person } = row;
              return (
                <TableRow key={person.user_id}>
                  <TableCell sx={{ minWidth: 160, maxWidth: 220 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="subtitle2">
                        {person.full_name || person.email}
                      </Typography>
                      <PlanBadge person={person} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: 'text.secondary' }}
                    >
                      {t('planUsage.requests', { count: row.requests.toLocaleString() })}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: 'text.disabled', wordBreak: 'break-all' }}
                    >
                      {person.claude_email ?? person.email}
                    </Typography>
                  </TableCell>
                  {days.map((day) => (
                    <DayCell
                      key={day}
                      row={row.days.get(day)}
                      tier={person.claude_tier ?? null}
                      max={max}
                    />
                  ))}
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="subtitle2">
                      {formatTokens(row.input)} {t('planUsage.in')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: 'success.main' }}>
                      {formatTokens(row.output)} {t('planUsage.out')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ minWidth: 90 }}>
                    <Typography variant="subtitle2">{formatShare(shown, share)}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={share}
                      aria-label={t('planUsage.share')}
                      sx={{ height: 4, mt: 0.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1">
                      {row.cost === null ? '—' : formatUsd(row.cost)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {unused.length > 0 && (
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          {t('planUsage.unused', { names: unused.join(', ') })}
        </Typography>
      )}
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.disabled' }}>
        {t('planUsage.footnote')}
      </Typography>
    </>
  );
}

export function PlanUsageCard({
  people,
  action,
}: {
  people: OverviewPerson[];
  action?: React.ReactNode;
}) {
  const { t } = useTranslate('usage');
  const { range } = useReportRange();
  const week = useMemo(() => lastDays(WEEK_DAYS, new Date(), range.tz), [range.tz]);
  const load = useCallback(() => getDaily(week), [week]);
  const { data } = useFetch(load);

  return (
    <ChartCard title={t('planUsage.title')} action={action}>
      <UsageGrid people={people} daily={data ?? []} days={rangeDates(week)} />
    </ChartCard>
  );
}
