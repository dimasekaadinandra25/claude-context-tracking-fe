import dayjs from 'dayjs';

export type ReportRange = { from: Date; to: Date; tz: string };

export const DEFAULT_DAYS = 7;
const DATE_FORMAT = 'YYYY-MM-DD';

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function lastDays(
  days: number,
  now: Date = new Date(),
  tz: string = browserTimeZone()
): ReportRange {
  const today = dayjs(now).startOf('day');
  return {
    from: today.subtract(days - 1, 'day').toDate(),
    to: today.add(1, 'day').toDate(),
    tz,
  };
}

export function defaultRange(now: Date = new Date(), tz: string = browserTimeZone()): ReportRange {
  return lastDays(DEFAULT_DAYS, now, tz);
}

export function rangeDays(range: ReportRange): number {
  return dayjs(range.to).diff(range.from, 'day');
}

export function previousRange(range: ReportRange, now: Date = new Date()): ReportRange {
  const from = range.from.getTime();
  const length = range.to.getTime() - from;
  const end = Math.min(now.getTime(), range.to.getTime());
  const elapsed = end > from ? end - from : length;
  return {
    from: new Date(from - length),
    to: new Date(from - length + elapsed),
    tz: range.tz,
  };
}

export function isSameRange(a: ReportRange, b: ReportRange): boolean {
  return a.from.getTime() === b.from.getTime() && a.to.getTime() === b.to.getTime();
}

export function buildRangeParams(range: ReportRange): Record<string, string> {
  return { from: range.from.toISOString(), to: range.to.toISOString(), tz: range.tz };
}

export function rangeToDays(range: ReportRange): { start: string; end: string } {
  return {
    start: dayjs(range.from).format(DATE_FORMAT),
    end: dayjs(range.to).subtract(1, 'millisecond').format(DATE_FORMAT),
  };
}

export function daysToRange(start: string, end: string, tz: string): ReportRange {
  return {
    from: dayjs(start).startOf('day').toDate(),
    to: dayjs(end).add(1, 'day').startOf('day').toDate(),
    tz,
  };
}

export function rangeDates(range: ReportRange): string[] {
  return Array.from({ length: rangeDays(range) }, (_, i) =>
    dayjs(range.from).add(i, 'day').format(DATE_FORMAT)
  );
}
