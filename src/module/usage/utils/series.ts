import type { TimeseriesPoint } from '../types';

export type StackedSeries = {
  buckets: string[];
  series: { id: string; label: string; data: number[] }[];
};

export function toStackedSeries(
  points: TimeseriesPoint[],
  labelOf: (key: string) => string = (key) => key
): StackedSeries {
  const buckets = [...new Set(points.map((p) => p.bucket))].sort();
  const keys = [...new Set(points.map((p) => p.key))];
  const index = new Map(buckets.map((b, i) => [b, i]));
  const series = keys.map((key) => {
    const data = buckets.map(() => 0);
    points
      .filter((p) => p.key === key)
      .forEach((p) => {
        data[index.get(p.bucket) ?? 0] += p.new_context;
      });
    return { id: key, label: labelOf(key), data };
  });
  return { buckets, series };
}
