import type { TimeseriesPoint } from '../types';

export type StackedSeries = {
  buckets: string[];
  series: { id: string; label: string; data: number[] }[];
};

const DAYS_PER_WEEK = 7;
const HOURS_PER_DAY = 24;
const DATE_LENGTH = 10;
const HOUR_MS = 3_600_000;

export function toStackedSeries(
  points: TimeseriesPoint[],
  labelOf: (key: string) => string = (key) => key,
  buckets: string[] = [...new Set(points.map((p) => p.bucket))].sort()
): StackedSeries {
  const keys = [...new Set(points.map((p) => p.key))];
  const index = new Map(buckets.map((b, i) => [b, i]));
  const series = keys.map((key) => {
    const data = buckets.map(() => 0);
    points
      .filter((p) => p.key === key)
      .forEach((p) => {
        const i = index.get(p.bucket);
        if (i !== undefined) data[i] += p.new_context;
      });
    return { id: key, label: labelOf(key), data };
  });
  return { buckets, series };
}

export function toDailyStackedSeries(
  points: TimeseriesPoint[],
  days: string[],
  labelOf?: (key: string) => string
): StackedSeries {
  const daily = points.map((p) => ({ ...p, bucket: p.bucket.slice(0, DATE_LENGTH) }));
  return toStackedSeries(daily, labelOf, days);
}

export function toHourlyStackedSeries(points: TimeseriesPoint[]): StackedSeries {
  const hourly = points.map((p) => ({ ...p, bucket: new Date(p.bucket).toISOString() }));
  const times = hourly.map((p) => new Date(p.bucket).getTime());
  const first = Math.min(...times);
  const count = times.length ? Math.round((Math.max(...times) - first) / HOUR_MS) + 1 : 0;
  const buckets = Array.from({ length: count }, (_, i) =>
    new Date(first + i * HOUR_MS).toISOString()
  );
  return toStackedSeries(hourly, undefined, buckets);
}
const HOUR_START = 11;
const HOUR_END = 13;

function weekHour(bucket: string): [number, number] {
  const weekday = new Date(bucket.slice(0, DATE_LENGTH)).getUTCDay();
  return [
    (weekday + DAYS_PER_WEEK - 1) % DAYS_PER_WEEK,
    Number(bucket.slice(HOUR_START, HOUR_END)),
  ];
}

export function toWeekHourGrid(points: TimeseriesPoint[]): number[][] {
  const grid = Array.from({ length: DAYS_PER_WEEK }, () => Array<number>(HOURS_PER_DAY).fill(0));
  points.forEach((p) => {
    const [day, hour] = weekHour(p.bucket);
    grid[day][hour] += p.new_context;
  });
  return grid;
}

export function cellBuckets(
  points: TimeseriesPoint[],
  day: number,
  hour: number
): { bucket: string; tokens: number }[] {
  const totals = new Map<string, number>();
  points.forEach((p) => {
    const [d, h] = weekHour(p.bucket);
    if (d === day && h === hour) totals.set(p.bucket, (totals.get(p.bucket) ?? 0) + p.new_context);
  });
  return [...totals]
    .map(([bucket, tokens]) => ({ bucket, tokens }))
    .sort((a, b) => new Date(b.bucket).getTime() - new Date(a.bucket).getTime());
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
