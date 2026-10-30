import dayjs from 'dayjs';

export type ReportRange = { from: Date; to: Date; tz: string };

const DEFAULT_DAYS = 7;

export function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function defaultRange(now: Date = new Date(), tz: string = browserTimeZone()): ReportRange {
  const today = dayjs(now).startOf('day');
  return {
    from: today.subtract(DEFAULT_DAYS - 1, 'day').toDate(),
    to: today.add(1, 'day').toDate(),
    tz,
  };
}

export function buildRangeParams(range: ReportRange): Record<string, string> {
  return { from: range.from.toISOString(), to: range.to.toISOString(), tz: range.tz };
}

export function rangeToDays(range: ReportRange): { start: string; end: string } {
  return {
    start: dayjs(range.from).format('YYYY-MM-DD'),
    end: dayjs(range.to).subtract(1, 'day').format('YYYY-MM-DD'),
  };
}

export function daysToRange(start: string, end: string, tz: string): ReportRange {
  return {
    from: dayjs(start).startOf('day').toDate(),
    to: dayjs(end).add(1, 'day').startOf('day').toDate(),
    tz,
  };
}
