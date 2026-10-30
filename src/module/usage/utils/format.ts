import dayjs from 'dayjs';

const THOUSAND = 1_000;
const MILLION = 1_000_000;

export function formatTokens(tokens: number): string {
  if (tokens >= MILLION) return `${(tokens / MILLION).toFixed(1).replace(/\.0$/, '')}M`;
  if (tokens >= THOUSAND) return `${(tokens / THOUSAND).toFixed(1)}K`;
  return String(tokens);
}

export function formatBucket(iso: string, interval: 'hour' | 'day'): string {
  return dayjs(iso).format(interval === 'hour' ? 'DD MMM HH:00' : 'DD MMM');
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format('DD MMM YYYY HH:mm') : '-';
}
