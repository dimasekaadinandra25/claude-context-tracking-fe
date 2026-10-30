import dayjs from 'dayjs';

const THOUSAND = 1_000;
const MILLION = 1_000_000;

const scaled = (tokens: number, unit: number) => (tokens / unit).toFixed(1).replace(/\.0$/, '');

export function formatTokens(tokens: number): string {
  if (tokens >= MILLION) return `${scaled(tokens, MILLION)}M`;
  if (tokens >= THOUSAND) return `${scaled(tokens, THOUSAND)}K`;
  return String(tokens);
}

export function formatBucket(iso: string, interval: 'hour' | 'day'): string {
  return dayjs(iso).format(interval === 'hour' ? 'DD MMM HH:00' : 'DD MMM');
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dayjs(iso).format('DD MMM YYYY HH:mm') : '-';
}

const MODEL_PREFIX = 'claude-';

export function shortModel(model: string): string {
  return model.startsWith(MODEL_PREFIX) ? model.slice(MODEL_PREFIX.length) : model;
}
