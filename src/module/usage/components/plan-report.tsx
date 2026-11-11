import type { DailyUsage, ModelUsage, OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { toPng } from 'html-to-image';
import { createPortal } from 'react-dom';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useTranslate } from 'src/locales';
import { getDaily, getModels } from 'src/module/usage/api/usage';
import { shortModel, formatTokens } from 'src/module/usage/utils/format';
import { lastDays, rangeDates, browserTimeZone } from 'src/module/usage/utils/range';
import {
  PERCENT,
  WEEK_DAYS,
  daysRange,
  oneDecimal,
  windowDays,
  weekElapsed,
  roundToTotal,
  OUTPUT_WEIGHT,
} from 'src/module/usage/utils/plan';

import { UsageGrid } from './plan-usage-card';
import { LimitRow, Allowance, DailyBars, PlanBadge } from './plan-limits';

const REPORT_WIDTH = 1180;
const PIXEL_RATIO = 2;
const OFFSCREEN = -10_000;
const PERIOD_FORMAT = 'ddd D MMM';

export type PlanReportData = {
  people: OverviewPerson[];
  account: OverviewPerson | null;
  days: string[];
  daily: DailyUsage[];
  models: ModelUsage[];
};

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

const modelWeight = (model: ModelUsage) =>
  model.input_tokens +
  model.cache_write_tokens +
  model.cache_read_tokens +
  OUTPUT_WEIGHT * model.output_tokens;

export function modelLabel(model: string): string {
  const [family = '', ...version] = shortModel(model)
    .replace(/-\d{8}$/, '')
    .split('-');
  const name = family.charAt(0).toUpperCase() + family.slice(1);
  return version.length > 0 ? `${name} ${version.join('.')}` : name;
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
      {sorted.map((model, index) => {
        const share = shares[index];
        return (
          <Box
            key={model.model}
            sx={{
              display: 'grid',
              gridTemplateColumns: '170px 1fr 72px',
              columnGap: 2,
              rowGap: 0.5,
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', pl: 1 }}>
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
            <Typography variant="caption" sx={{ gridColumn: '2 / 4', color: 'text.secondary' }}>
              {t('report.modelDetail', {
                requests: model.requests.toLocaleString(),
                input: formatTokens(
                  model.input_tokens + model.cache_write_tokens + model.cache_read_tokens
                ),
                output: formatTokens(model.output_tokens),
              })}
            </Typography>
          </Box>
        );
      })}
      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
        {t('report.modelNote')}
      </Typography>
    </Stack>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Box sx={{ mt: 1.5 }}>{children}</Box>
    </Box>
  );
}

export function PlanReport({ report }: { report: PlanReportData }) {
  const { t } = useTranslate('usage');
  const { account, days, daily, people, models } = report;
  const period = `${dayjs(days[0]).format(PERIOD_FORMAT)} – ${dayjs(days[days.length - 1]).format(PERIOD_FORMAT)}`;
  const used = account?.seven_day_used ?? null;
  const resetsAt = account?.seven_day_resets_at ?? null;

  return (
    <Box sx={{ width: REPORT_WIDTH, p: 4, bgcolor: 'background.default', color: 'text.primary' }}>
      <Typography variant="h4">{t('report.title')}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {account ? t('report.window', { period }) : t('report.period', { period })}
      </Typography>
      {account && used !== null && resetsAt && (
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
              <ModelRows models={models} />
              <Allowance used={used} tier={account.claude_tier ?? null} />
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
      )}
      {!(account && used !== null && resetsAt) && models.length > 0 && (
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

function download(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = `claude-usage-${dayjs().format('YYYY-MM-DD-HHmm')}.png`;
  link.click();
}

export async function loadReport(people: OverviewPerson[]): Promise<PlanReportData> {
  const account = mainAccount(people);
  const days = account?.seven_day_resets_at
    ? windowDays(account.seven_day_resets_at)
    : rangeDates(lastDays(WEEK_DAYS, new Date(), browserTimeZone()));
  const range = daysRange(days);
  const [daily, models] = await Promise.all([getDaily(range), getModels(range)]);
  return { people, account, days, daily, models };
}

export function ExportImageButton({ people }: { people: OverviewPerson[] }) {
  const { t } = useTranslate('usage');
  const [report, setReport] = useState<PlanReportData | null>(null);
  const [busy, setBusy] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  const start = () => {
    setBusy(true);
    loadReport(people)
      .then(setReport)
      .catch(() => setBusy(false));
  };

  useEffect(() => {
    if (!report || !node.current) return undefined;
    let active = true;
    toPng(node.current, { pixelRatio: PIXEL_RATIO })
      .then((url) => active && download(url))
      .finally(() => {
        if (!active) return;
        setReport(null);
        setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [report]);

  return (
    <>
      <Button size="small" variant="outlined" onClick={start} disabled={busy}>
        {busy ? t('report.exporting') : t('report.export')}
      </Button>
      {report &&
        createPortal(
          <Box sx={{ position: 'fixed', left: OFFSCREEN, top: 0 }}>
            <Box ref={node}>
              <PlanReport report={report} />
            </Box>
          </Box>,
          document.body
        )}
    </>
  );
}
