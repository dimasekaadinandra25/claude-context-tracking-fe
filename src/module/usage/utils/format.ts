import type { CacheUsage } from '../types';

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

const PERCENT = 100;

export function cacheHitRate(usage: CacheUsage): number | null {
  const total = usage.input_tokens + usage.cache_write_tokens + usage.cache_read_tokens;
  return total > 0 ? usage.cache_read_tokens / total : null;
}

export function formatPercent(ratio: number | null): string {
  return ratio === null ? '—' : `${Math.round(ratio * PERCENT)}%`;
}

const MODEL_PREFIX = 'claude-';

export function shortModel(model: string): string {
  return model.startsWith(MODEL_PREFIX) ? model.slice(MODEL_PREFIX.length) : model;
}
