import { DateRangePicker } from 'src/shared/ui/date-range-picker';

import { daysToRange, rangeToDays } from '../utils/range';
import { useReportRange } from '../hooks/use-report-range';

export function RangePicker() {
  const { range, setRange } = useReportRange();
  const { start, end } = rangeToDays(range);

  return (
    <DateRangePicker
      startDate={start}
      endDate={end}
      onApply={(value) => setRange(daysToRange(value.start, value.end, range.tz))}
    />
  );
}
