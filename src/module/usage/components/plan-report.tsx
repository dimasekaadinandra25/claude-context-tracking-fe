import type { DailyUsage, ModelUsage, OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useTranslate } from 'src/locales';
import { modelLabel, formatTokens } from 'src/module/usage/utils/format';
import {
  PERCENT,
  oneDecimal,
  weekElapsed,
  roundToTotal,
  OUTPUT_WEIGHT,
} from 'src/module/usage/utils/plan';

import { DailyBars } from './daily-bars';
import { UsageGrid } from './plan-usage-card';
import { LimitRow, Allowance, PlanBadge, BudgetLine, ModelLimitRows } from './plan-limits';

const REPORT_WIDTH = 1180;
const PERIOD_FORMAT = 'ddd D MMM';
const TEXT_SECONDARY = 'text.secondary';

export type PlanReportData = {
  people: OverviewPerson[];
  account: OverviewPerson | null;
  days: string[];
  daily: DailyUsage[];
  models: ModelUsage[];
  lastWeek?: LastWeek | null;
};

export type LastWeek = { day: string; used: number };

const accountOf = (person: OverviewPerson) => (person.claude_email ?? '').toLowerCase();

export function mainAccount(people: OverviewPerson[]): OverviewPerson | null {
  const live = people.filter(
    (person) => accountOf(person) && person.seven_day_used !== null && person.seven_day_resets_at
  );
  const members = new Map<string, number>();
  live.forEach((person) =>
    members.set(accountOf(person), (members.get(accountOf(person)) ?? 0) + 1)
  );
  return (
    [...live].sort(
      (a, b) => (members.get(accountOf(b)) ?? 0) - (members.get(accountOf(a)) ?? 0)
    )[0] ?? null
  );
}

const outputOf = (model: ModelUsage) => model.output_tokens + model.subagent_output_tokens;

const modelWeight = (model: ModelUsage) =>
  model.input_tokens +
  model.cache_write_tokens +
  model.cache_read_tokens +
  OUTPUT_WEIGHT * outputOf(model);

function ModelRow({ model, share }: { model: ModelUsage; share: number }) {
  const { t } = useTranslate('usage');
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '170px 1fr 72px',
        columnGap: 2,
        rowGap: 0.5,
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" sx={{ color: TEXT_SECONDARY, pl: 1 }}>
        └ {modelLabel(model.model)}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={share}
        aria-label={model.model}
        sx={{ height: 6 }}
      />
      <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
        {oneDecimal(share)}%
      </Typography>
      <Typography variant="caption" sx={{ gridColumn: '2 / 4', color: TEXT_SECONDARY }}>
        {t('report.modelDetail', {
          requests: (model.requests + model.subagent_requests).toLocaleString(),
          input: formatTokens(
            model.input_tokens + model.cache_write_tokens + model.cache_read_tokens
          ),
          output: formatTokens(outputOf(model)),
        })}
      </Typography>
    </Box>
  );
}

export function ModelRows({ models }: { models: ModelUsage[] }) {
  const { t } = useTranslate('usage');
  const sorted = models
    .filter((model) => modelWeight(model) > 0)
    .sort((a, b) => modelWeight(b) - modelWeight(a));
  const total = sorted.reduce((sum, model) => sum + modelWeight(model), 0);

  if (total === 0) return null;
  const shares = roundToTotal(sorted.map(modelWeight), PERCENT);

  return (
    <Stack spacing={1.5}>
      {sorted.map((model, index) => (
        <ModelRow key={model.model} model={model} share={shares[index]} />
      ))}
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {t('report.modelNote')}
      </Typography>
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="overline" sx={{ color: TEXT_SECONDARY }}>
        {title}
      </Typography>
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  );
}

function AccountSections({
  report,
  account,
  used,
  resetsAt,
}: {
  report: PlanReportData;
  account: OverviewPerson;
  used: number;
  resetsAt: string;
}) {
  const { t } = useTranslate('usage');
  const { days, daily, models } = report;
  return (
    <>
      <Section title={t('report.account')}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">{account.claude_email}</Typography>
            <PlanBadge person={account} />
          </Box>
          <LimitRow
            label={t('limits.sevenDay')}
            used={used}
            resetsAt={resetsAt}
            capturedAt={account.limits_captured_at}
            elapsed={weekElapsed(resetsAt)}
          />
          <ModelLimitRows person={account} />
          <ModelRows models={models} />
          <Allowance used={used} tier={account.claude_tier ?? null} />
          <BudgetLine used={used} resetsAt={resetsAt} lastWeek={report.lastWeek ?? null} />
        </Stack>
      </Section>
      <Section title={t('report.daily')}>
        <DailyBars
          days={days}
          rows={daily.filter((row) => row.user_id === account.user_id)}
          title={false}
        />
      </Section>
    </>
  );
}

function liveAccount({ account }: PlanReportData) {
  const used = account?.seven_day_used ?? null;
  const resetsAt = account?.seven_day_resets_at ?? null;
  if (!account || used === null || !resetsAt) return null;
  return { account, used, resetsAt };
}

export function PlanReport({ report }: { report: PlanReportData }) {
  const { t } = useTranslate('usage');
  const { days, daily, people, models } = report;
  const period = `${dayjs(days[0]).format(PERIOD_FORMAT)} – ${dayjs(days[days.length - 1]).format(PERIOD_FORMAT)}`;
  const live = liveAccount(report);

  return (
    <Box
      sx={{
        width: 'min-content',
        minWidth: REPORT_WIDTH,
        p: 4,
        bgcolor: 'background.default',
        color: 'text.primary',
        '& .MuiTableContainer-root': { overflow: 'visible' },
      }}
    >
      <Typography variant="h4">{t('report.title')}</Typography>
      <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
        {live ? t('report.window', { period }) : t('report.period', { period })}
      </Typography>
      {live && <AccountSections report={report} {...live} />}
      {!live && models.length > 0 && (
        <Section title={t('report.models')}>
          <ModelRows models={models} />
        </Section>
      )}
      <Section title={t('report.members')}>
        <UsageGrid people={people} daily={daily} days={days} />
      </Section>
      <Typography variant="caption" sx={{ display: 'block', mt: 3, color: 'text.disabled' }}>
        {t('report.generated', { when: dayjs().format('ddd D MMM YYYY HH:mm') })}
      </Typography>
    </Box>
  );
}
