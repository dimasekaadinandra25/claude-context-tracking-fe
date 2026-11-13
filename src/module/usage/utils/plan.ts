import type { DailyUsage, OverviewPerson } from '../types';

import dayjs from 'dayjs';

import { browserTimeZone, type ReportRange } from './range';

export const PERCENT = 100;
export const WEEK_DAYS = 7;
export const PACE_PERCENT = PERCENT / WEEK_DAYS;
const DAY_MS = 86_400_000;
const WEEK_MS = WEEK_DAYS * DAY_MS;
const MONTHS_PER_YEAR = 12;
const WEEKS_PER_YEAR = 52;
export const OUTPUT_WEIGHT = 5;
const DATE_FORMAT = 'YYYY-MM-DD';

const MAX_20X_PRICE = 200;
const MAX_5X_PRICE = 100;
const PRO_PRICE = 20;

const PLAN_PRICES: [RegExp, number][] = [
  [/max_20x/, MAX_20X_PRICE],
  [/max_5x/, MAX_5X_PRICE],
  [/pro/, PRO_PRICE],
];

type Account = Pick<OverviewPerson, 'claude_plan' | 'claude_tier'>;

export function planPrice(tier: string | null): number | null {
  if (!tier) return null;
  return PLAN_PRICES.find(([pattern]) => pattern.test(tier))?.[1] ?? null;
}

export function planLabel({ claude_plan, claude_tier }: Account): string | null {
  const multiple = claude_tier?.match(/max_(\d+x)/)?.[1];
  if (multiple) return `Max ${multiple}`;
  return claude_plan;
}

export const weeklyAllowance = (monthly: number) => (monthly * MONTHS_PER_YEAR) / WEEKS_PER_YEAR;

const STEPS_PER_UNIT = 10;

export function roundToTotal(values: number[], total: number): number[] {
  const sum = values.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) return values.map(() => 0);
  const steps = Math.round(total * STEPS_PER_UNIT);
  const exact = values.map((value) => (value / sum) * steps);
  const rounded = exact.map(Math.floor);
  const left = steps - rounded.reduce((acc, value) => acc + value, 0);
  exact
    .map((value, index) => ({ index, remainder: value - rounded[index] }))
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, left)
    .forEach(({ index }) => {
      rounded[index] += 1;
    });
  return rounded.map((value) => value / STEPS_PER_UNIT);
}

export const oneDecimal = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatUsd = (amount: number) => `$${amount.toFixed(2)}`;

export function weekElapsed(resetsAt: string, now: number = Date.now()): number {
  const left = dayjs(resetsAt).valueOf() - now;
  return Math.min(PERCENT, Math.max(0, (1 - left / WEEK_MS) * PERCENT));
}

export type Budget = {
  perDay: number;
  daysLeft: number;
  projected: number | null;
  runsOutAt: number | null;
};

export function budgetOf(used: number, resetsAt: string, now: number = Date.now()): Budget | null {
  const leftMs = dayjs(resetsAt).valueOf() - now;
  if (leftMs <= 0) return null;
  const daysLeft = leftMs / DAY_MS;
  const elapsedMs = WEEK_MS - leftMs;
  const projected = elapsedMs >= DAY_MS ? (used / elapsedMs) * WEEK_MS : null;
  const runsOut = projected !== null && projected > PERCENT && used < PERCENT;
  return {
    perDay: Math.max(0, PERCENT - used) / Math.max(daysLeft, 1),
    daysLeft,
    projected,
    runsOutAt: runsOut ? now + ((PERCENT - used) / used) * elapsedMs : null,
  };
}

export function windowDays(resetsAt: string): string[] {
  const end = dayjs(resetsAt).startOf('day');
  const start = dayjs(resetsAt).subtract(WEEK_DAYS, 'day').startOf('day');
  const count = end.diff(start, 'day') + 1;
  return Array.from({ length: count }, (_, i) => start.add(i, 'day').format(DATE_FORMAT));
}

export function daysRange(days: string[]): ReportRange {
  return {
    from: dayjs(days[0]).toDate(),
    to: dayjs(days[days.length - 1])
      .add(1, 'day')
      .toDate(),
    tz: browserTimeZone(),
  };
}

export const inputOf = (day: DailyUsage) =>
  day.input_tokens + day.cache_write_tokens + day.cache_read_tokens;

export const weightOf = (day: DailyUsage) => inputOf(day) + OUTPUT_WEIGHT * day.output_tokens;

export function costOf(limitUsed: number | null, tier: string | null): number | null {
  const price = planPrice(tier);
  if (price === null || limitUsed === null) return null;
  return (limitUsed / PERCENT) * weeklyAllowance(price);
}

export const isShared = (day: DailyUsage) => day.account_members > 1;

export const hasTokens = (day: DailyUsage) => inputOf(day) + day.output_tokens > 0;

function memberShare(day: DailyUsage): number {
  if (!isShared(day)) return 1;
  if (day.account_weight > 0) return weightOf(day) / day.account_weight;
  return 1 / day.account_members;
}

export function memberCost(day: DailyUsage, tier: string | null): number | null {
  const accountCost = costOf(day.limit_used, tier);
  return accountCost === null ? null : accountCost * memberShare(day);
}

export function rangeCost(daily: DailyUsage[], people: OverviewPerson[]): number | null {
  const tiers = new Map(people.map((person) => [person.user_id, person.claude_tier ?? null]));
  const costs = daily
    .map((day) => memberCost(day, tiers.get(day.user_id) ?? null))
    .filter((cost): cost is number => cost !== null);
  return costs.length > 0 ? costs.reduce((total, cost) => total + cost, 0) : null;
}

export function memberLimitUsed(day: DailyUsage): number | null {
  return day.limit_used === null ? null : day.limit_used * memberShare(day);
}

export const fairDailyShare = (day: DailyUsage) => PACE_PERCENT / Math.max(day.account_members, 1);

export const isHeavyDay = (day: DailyUsage) => (memberLimitUsed(day) ?? 0) > fairDailyShare(day);
