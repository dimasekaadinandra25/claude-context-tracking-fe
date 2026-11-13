import type { Theme } from '@mui/material/styles';
import type { MemberUsage } from 'src/module/usage/utils/member-rows';
import type { DailyUsage, OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useTranslate } from 'src/locales';
import { getDaily } from 'src/module/usage/api/usage';
import { useFetch } from 'src/module/usage/hooks/use-fetch';
import { formatTokens } from 'src/module/usage/utils/format';
import { memberRows } from 'src/module/usage/utils/member-rows';
import { ChartCard } from 'src/module/usage/components/chart-card';
import { lastDays, rangeDates } from 'src/module/usage/utils/range';
import { EmptyState } from 'src/module/usage/components/empty-state';
import { useReportRange } from 'src/module/usage/hooks/use-report-range';
import { NameCell, ShareCell } from 'src/module/usage/components/member-cells';
import {
  inputOf,
  PERCENT,
  isShared,
  hasTokens,
  WEEK_DAYS,
  formatUsd,
  memberCost,
  oneDecimal,
  isHeavyDay,
  roundToTotal,
  fairDailyShare,
  memberLimitUsed,
} from 'src/module/usage/utils/plan';

const FONT_WEIGHT_TODAY = 700;
const FONT_WEIGHT_DEFAULT = 400;

const BLOCK = 'block';
const TEXT_SECONDARY = 'text.secondary';
const CELL_WIDTH = 76;
const MIN_SHADE = 0.08;
const MAX_SHADE = 0.55;
function DayCell({ row, tier, max }: { row?: DailyUsage; tier: string | null; max: number }) {
  const { t } = useTranslate('usage');
  if (!row || (isShared(row) && !hasTokens(row))) {
    return (
      <TableCell align="center" sx={{ color: 'text.disabled' }}>
        –
      </TableCell>
    );
  }
  const cost = memberCost(row, tier);
  const shade = MIN_SHADE + (MAX_SHADE - MIN_SHADE) * (max > 0 ? inputOf(row) / max : 0);
  const heavy = isHeavyDay(row);

  return (
    <TableCell
      align="center"
      title={
        heavy
          ? t('planUsage.heavy', {
              used: oneDecimal(memberLimitUsed(row) ?? 0),
              fair: oneDecimal(fairDailyShare(row)),
            })
          : undefined
      }
      sx={(theme: Theme) => ({
        px: 0.5,
        width: CELL_WIDTH,
        minWidth: CELL_WIDTH,
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, shade),
        borderRadius: 1,
        border: `3px solid ${heavy ? theme.vars.palette.warning.main : theme.vars.palette.background.paper}`,
      })}
    >
      <Typography variant="subtitle2">{formatTokens(inputOf(row))}</Typography>
      <Typography variant="caption" sx={{ display: BLOCK, color: 'success.main' }}>
        {formatTokens(row.output_tokens)}
      </Typography>
      {row.limit_used !== null && !isShared(row) && (
        <Typography variant="caption" sx={{ display: BLOCK, color: TEXT_SECONDARY }}>
          +{Math.round(row.limit_used)}%
        </Typography>
      )}
      {cost !== null && (
        <Typography variant="caption" sx={{ display: BLOCK, color: TEXT_SECONDARY }}>
          {formatUsd(cost)}
        </Typography>
      )}
    </TableCell>
  );
}

function GridHead({ days }: { days: string[] }) {
  const { t } = useTranslate('usage');
  const today = dayjs().format('YYYY-MM-DD');
  return (
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
              fontWeight: day === today ? FONT_WEIGHT_TODAY : FONT_WEIGHT_DEFAULT,
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
  );
}

function MemberRow({
  row,
  days,
  max,
  share,
  shown,
}: {
  row: MemberUsage;
  days: string[];
  max: number;
  share: number;
  shown: number;
}) {
  const { t } = useTranslate('usage');
  const { person } = row;
  return (
    <TableRow>
      <NameCell row={row} />
      {days.map((day) => (
        <DayCell key={day} row={row.days.get(day)} tier={person.claude_tier ?? null} max={max} />
      ))}
      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="subtitle2">
          {formatTokens(row.input)} {t('planUsage.in')}
        </Typography>
        <Typography variant="caption" sx={{ display: BLOCK, color: 'success.main' }}>
          {formatTokens(row.output)} {t('planUsage.out')}
        </Typography>
      </TableCell>
      <ShareCell share={share} shown={shown} />
      <TableCell align="right">
        <Typography variant="subtitle1">{row.cost === null ? '—' : formatUsd(row.cost)}</Typography>
      </TableCell>
    </TableRow>
  );
}

function weightShares(rows: MemberUsage[]) {
  return {
    teamWeight: rows.reduce((total, row) => total + row.weight, 0),
    shares: roundToTotal(
      rows.map((row) => row.weight),
      PERCENT
    ),
  };
}

function unusedNames(people: OverviewPerson[], rows: MemberUsage[]) {
  return people
    .filter(
      (person) => person.is_active && !rows.some((row) => row.person.user_id === person.user_id)
    )
    .map((person) => person.full_name || person.email);
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
  const rows = memberRows(people, daily);
  const { teamWeight, shares } = weightShares(rows);
  const max = Math.max(0, ...daily.map(inputOf));
  const unused = unusedNames(people, rows);

  if (rows.length === 0) return <EmptyState message={t('planUsage.empty')} />;

  return (
    <>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 960, '& td, & th': { borderBottom: 'none' } }}>
          <GridHead days={days} />
          <TableBody>
            {rows.map((row, index) => (
              <MemberRow
                key={row.person.user_id}
                row={row}
                days={days}
                max={max}
                share={teamWeight > 0 ? (row.weight / teamWeight) * PERCENT : 0}
                shown={shares[index]}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {unused.length > 0 && (
        <Typography variant="body2" sx={{ mt: 2, color: TEXT_SECONDARY }}>
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
