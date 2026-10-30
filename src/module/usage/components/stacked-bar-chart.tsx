import type { Interval, TimeseriesPoint } from '../types';

import { BarChart } from '@mui/x-charts/BarChart';

import { useTranslate } from 'src/locales';

import { EmptyState } from './empty-state';
import { toStackedSeries } from '../utils/series';
import { formatTokens, formatBucket } from '../utils/format';

type Props = {
  points: TimeseriesPoint[];
  interval: Interval;
  labelOf?: (key: string) => string;
};

const CHART_HEIGHT = 320;
const Y_AXIS_WIDTH = 56;

const valueFormatter = (value: number | null) => formatTokens(value ?? 0);

export function StackedBarChart({ points, interval, labelOf }: Props) {
  const { t } = useTranslate('usage');

  if (points.length === 0) {
    return <EmptyState message={t('empty.chart')} />;
  }

  const { buckets, series } = toStackedSeries(points, labelOf);

  return (
    <BarChart
      height={CHART_HEIGHT}
      xAxis={[{ scaleType: 'band', data: buckets.map((b) => formatBucket(b, interval)) }]}
      yAxis={[{ width: Y_AXIS_WIDTH, valueFormatter: (value: number) => formatTokens(value) }]}
      series={series.map((s) => ({ ...s, stack: 'total', valueFormatter }))}
    />
  );
}
