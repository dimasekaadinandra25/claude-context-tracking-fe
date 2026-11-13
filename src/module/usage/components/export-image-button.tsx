import type { PlanReportData } from './plan-report';
import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { toPng } from 'html-to-image';
import { createPortal } from 'react-dom';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useTranslate } from 'src/locales';
import { getDaily, getModels } from 'src/module/usage/api/usage';
import { WEEK_DAYS, daysRange, windowDays } from 'src/module/usage/utils/plan';
import { lastDays, rangeDates, browserTimeZone } from 'src/module/usage/utils/range';

import { PlanReport, mainAccount } from './plan-report';

const PIXEL_RATIO = 2;
const OFFSCREEN = -10_000;

export function download(url: string, fileName: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
}

export async function loadReport(people: OverviewPerson[]): Promise<PlanReportData> {
  const account = mainAccount(people);
  const days = account?.seven_day_resets_at
    ? windowDays(account.seven_day_resets_at)
    : rangeDates(lastDays(WEEK_DAYS, new Date(), browserTimeZone()));
  const range = daysRange(days);
  const lastWeekDay = dayjs().subtract(WEEK_DAYS, 'day').format('YYYY-MM-DD');
  const [daily, models, before] = await Promise.all([
    getDaily(range),
    getModels(range),
    account ? getDaily(daysRange([lastWeekDay]), account.user_id) : Promise.resolve([]),
  ]);
  const used = before.find((row) => row.day === lastWeekDay)?.seven_day_used ?? null;
  const lastWeek = used === null ? null : { day: lastWeekDay, used };
  return { people, account, days, daily, models, lastWeek };
}

function useImageExport(people: OverviewPerson[]) {
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
      .then(
        (url) => active && download(url, `claude-usage-${dayjs().format('YYYY-MM-DD-HHmm')}.png`)
      )
      .finally(() => {
        if (!active) return;
        setReport(null);
        setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [report]);

  return { report, busy, start, node };
}

export function ExportImageButton({ people }: { people: OverviewPerson[] }) {
  const { t } = useTranslate('usage');
  const { report, busy, start, node } = useImageExport(people);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={start}
        disabled={busy}
        data-testid="export-image"
      >
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
