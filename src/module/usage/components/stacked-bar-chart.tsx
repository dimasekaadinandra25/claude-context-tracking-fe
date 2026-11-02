import type { TimeseriesPoint } from '../types';

import { BarChart } from '@mui/x-charts/BarChart';

import { useTranslate } from 'src/locales';

import { EmptyState } from './empty-state';
import { rangeDates } from '../utils/range';
import { toDailyStackedSeries } from '../utils/series';
import { useReportRange } from '../hooks/use-report-range';
import { formatTokens, formatBucket } from '../utils/format';

type Props = {
  points: TimeseriesPoint[];
  labelOf?: (key: string) => string;
};

const CHART_HEIGHT = 320;
const Y_AXIS_WIDTH = 56;

const valueFormatter = (value: number | null) => formatTokens(value ?? 0);

export function StackedBarChart({ points, labelOf }: Props) {
  const { t } = useTranslate('usage');
  const { range } = useReportRange();

  if (points.length === 0) {
    return <EmptyState message={t('empty.chart')} />;
  }

  const { buckets, series } = toDailyStackedSeries(points, rangeDates(range), labelOf);

  return (
    <BarChart
      height={CHART_HEIGHT}
      xAxis={[{ scaleType: 'band', data: buckets.map((b) => formatBucket(b, 'day')) }]}
      yAxis={[{ width: Y_AXIS_WIDTH, valueFormatter: (value: number) => formatTokens(value) }]}
      series={series.map((s) => ({ ...s, stack: 'total', valueFormatter }))}
    />
  );
}
