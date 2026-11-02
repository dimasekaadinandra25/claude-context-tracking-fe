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

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const DATE_LENGTH = 10;
const HOUR_START = 11;
const HOUR_END = 13;

export function toWeekHourGrid(points: TimeseriesPoint[]): number[][] {
  const grid = Array.from({ length: DAYS_PER_WEEK }, () => Array<number>(HOURS_PER_DAY).fill(0));
  points.forEach((p) => {
    const weekday = new Date(p.bucket.slice(0, DATE_LENGTH)).getUTCDay();
    const hour = Number(p.bucket.slice(HOUR_START, HOUR_END));
    grid[(weekday + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK][hour] += p.new_context;
  });
  return grid;
}

export function toDailyByKey(points: TimeseriesPoint[], days: string[]): Map<string, number[]> {
  const index = new Map(days.map((d, i) => [d, i]));
  const result = new Map<string, number[]>();
  points.forEach((p) => {
    const i = index.get(p.bucket.slice(0, DATE_LENGTH));
    if (i === undefined) return;
    const data = result.get(p.key) ?? days.map(() => 0);
    data[i] += p.new_context;
    result.set(p.key, data);
  });
  return result;
}
