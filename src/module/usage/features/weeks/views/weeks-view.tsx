import type { WeekUsage } from '../../../types';

import dayjs from 'dayjs';
import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { useTranslate } from 'src/locales';

import { getWeeks } from '../../../api/usage';
import { lastDays } from '../../../utils/range';
import { useFetch } from '../../../hooks/use-fetch';
import { PageShell } from '../../../components/page-shell';
import { EmptyState } from '../../../components/empty-state';
import { modelLabel, formatTokens } from '../../../utils/format';
import { PERCENT, WEEK_DAYS, planPrice, formatUsd, weeklyAllowance } from '../../../utils/plan';

const WEEKS = 12;

type Member = { userId: string; name: string; weight: number; input: number; output: number };

export type Week = {
  key: string;
  email: string | null;
  tier: string | null;
  resetsAt: string;
  used: number;
  topModel: string | null;
  members: Member[];
};

export function groupWeeks(rows: WeekUsage[]): Week[] {
  const weeks = new Map<string, Week>();
  rows.forEach((row) => {
    const key = `${row.account}|${row.resets_at}`;
    const week = weeks.get(key) ?? {
      key,
      email: row.claude_email,
      tier: row.claude_tier,
      resetsAt: row.resets_at,
      used: row.used,
      topModel: row.top_model,
      members: [],
    };
    if (row.user_id) {
      week.members.push({
        userId: row.user_id,
        name: row.full_name || row.user_id,
        weight: row.weight,
        input: row.input_tokens,
        output: row.output_tokens,
      });
    }
    weeks.set(key, week);
  });
  return [...weeks.values()];
}

export function weekCost(week: Week): number | null {
  const price = planPrice(week.tier);
  return price === null ? null : (Math.min(week.used, PERCENT) / PERCENT) * weeklyAllowance(price);
}

function MemberChips({ week }: { week: Week }) {
  const total = week.members.reduce((sum, member) => sum + member.weight, 0);
  const cost = weekCost(week);
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {week.members.map((member) => {
        const share = total > 0 ? member.weight / total : 0;
        const label = [
          member.name,
          `${Math.round(share * PERCENT)}%`,
          cost !== null ? formatUsd(cost * share) : null,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Chip
            key={member.userId}
            size="small"
            label={label}
            title={`${formatTokens(member.input)} in · ${formatTokens(member.output)} out`}
          />
        );
      })}
    </Box>
  );
}

export function WeeksView() {
  const { t } = useTranslate('usage');
  const load = useCallback(() => getWeeks(lastDays(WEEKS * WEEK_DAYS)), []);
  const { data, error, loading } = useFetch(load);
  const weeks = groupWeeks(data ?? []);
  const accounts = new Set(weeks.map((week) => week.email)).size;

  return (
    <PageShell title={t('weeks.title')} loading={loading} error={error}>
      <Card>
        {weeks.length === 0 ? (
          <EmptyState message={t('weeks.empty')} />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('weeks.window')}</TableCell>
                  {accounts > 1 && <TableCell>{t('weeks.account')}</TableCell>}
                  <TableCell sx={{ minWidth: 160 }}>{t('weeks.used')}</TableCell>
                  <TableCell align="right">{t('weeks.cost')}</TableCell>
                  <TableCell>{t('weeks.topModel')}</TableCell>
                  <TableCell>{t('weeks.members')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weeks.map((week) => {
                  const end = dayjs(week.resetsAt);
                  const cost = weekCost(week);
                  return (
                    <TableRow key={week.key}>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {`${end.subtract(WEEK_DAYS, 'day').format('D MMM')} – ${end.format('D MMM HH:mm')}`}
                        {end.isAfter(dayjs()) && (
                          <Chip size="small" label={t('weeks.current')} sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      {accounts > 1 && <TableCell>{week.email ?? '—'}</TableCell>}
                      <TableCell>
                        <Typography variant="subtitle2">{Math.round(week.used)}%</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(week.used, PERCENT)}
                          sx={{ height: 6 }}
                        />
                      </TableCell>
                      <TableCell align="right">{cost !== null ? formatUsd(cost) : '—'}</TableCell>
                      <TableCell>{week.topModel ? modelLabel(week.topModel) : '—'}</TableCell>
                      <TableCell>
                        <MemberChips week={week} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {t('weeks.note')}
      </Typography>
    </PageShell>
  );
}
