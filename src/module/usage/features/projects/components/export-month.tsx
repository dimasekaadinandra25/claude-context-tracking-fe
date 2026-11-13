import dayjs from 'dayjs';
import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { useTranslate } from 'src/locales';
import { toast } from 'src/shared/ui/snackbar';

import { getCosts } from '../../../api/usage';
import { costsCsv } from '../../../utils/costs-csv';
import { browserTimeZone } from '../../../utils/range';
import { download } from '../../../components/export-image-button';

const MONTH_FORMAT = 'YYYY-MM';

export function ExportMonth({ userId }: { userId: string }) {
  const { t } = useTranslate('usage');
  const [month, setMonth] = useState(() => dayjs().format(MONTH_FORMAT));
  const [busy, setBusy] = useState(false);

  const exportMonth = async () => {
    const from = dayjs(`${month}-01`).startOf('month');
    setBusy(true);
    try {
      const rows = await getCosts(
        { from: from.toDate(), to: from.add(1, 'month').toDate(), tz: browserTimeZone() },
        userId || undefined
      );
      const url = URL.createObjectURL(
        new Blob([costsCsv(rows, t)], { type: 'text/csv;charset=utf-8' })
      );
      download(url, `claude-usage-${month}.csv`);
      setTimeout(() => URL.revokeObjectURL(url));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <TextField
        type="month"
        size="small"
        label={t('costs.month')}
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Button variant="outlined" onClick={exportMonth} disabled={busy || !month}>
        {t('costs.export')}
      </Button>
    </Stack>
  );
}
