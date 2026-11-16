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
const LOW_CACHE_HIT = 0.5;

const cacheInput = (usage: CacheUsage) =>
  usage.input_tokens + usage.cache_write_tokens + usage.cache_read_tokens;

export function cacheHitRate(usage: CacheUsage): number | null {
  const total = cacheInput(usage);
  return total > 0 ? usage.cache_read_tokens / total : null;
}

export function isLowCacheHit(usage: CacheUsage): boolean {
  const total = cacheInput(usage);
  return total >= MILLION && usage.cache_read_tokens / total < LOW_CACHE_HIT;
}

export function formatPercent(ratio: number | null): string {
  return ratio === null ? '—' : `${Math.round(ratio * PERCENT)}%`;
}

const MODEL_PREFIX = 'claude-';

export function shortModel(model: string): string {
  return model.startsWith(MODEL_PREFIX) ? model.slice(MODEL_PREFIX.length) : model;
}

export function modelLabel(model: string): string {
  const [family = '', ...version] = shortModel(model)
    .replace(/-\d{8}$/, '')
    .split('-');
  const name = family.charAt(0).toUpperCase() + family.slice(1);
  return version.length > 0 ? `${name} ${version.join('.')}` : name;
}
