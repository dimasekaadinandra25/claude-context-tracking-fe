import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useTranslate } from 'src/locales';
import { DateRangePicker } from 'src/shared/ui/date-range-picker';

import { daysToRange, rangeToDays } from '../utils/range';
import { useReportRange } from '../hooks/use-report-range';

const QUICK_RANGES = [
  { days: 1, key: 'today' },
  { days: 7, key: 'last7' },
  { days: 30, key: 'last30' },
];

function QuickRanges() {
  const { t } = useTranslate('usage');
  const { preset, setPreset } = useReportRange();

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={preset}
      onChange={(_e, days: number | null) => days && setPreset(days)}
    >
      {QUICK_RANGES.map((q) => (
        <ToggleButton key={q.key} value={q.days}>
          {t(`range.${q.key}`)}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function RangePicker({ quick = false }: { quick?: boolean }) {
  const { range, setRange } = useReportRange();
  const { start, end } = rangeToDays(range);

  const picker = (
    <DateRangePicker
      startDate={start}
      endDate={end}
      onApply={(value) => setRange(daysToRange(value.start, value.end, range.tz))}
    />
  );

  if (!quick) return picker;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <QuickRanges />
      {picker}
    </Box>
  );
}
