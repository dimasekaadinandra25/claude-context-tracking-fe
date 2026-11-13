import type { DailyUsage } from '../types';

import { it, expect, describe } from 'vitest';

import {
  costOf,
  budgetOf,
  planLabel,
  planPrice,
  isHeavyDay,
  memberCost,
  windowDays,
  weekElapsed,
  roundToTotal,
  memberLimitUsed,
  weeklyAllowance,
} from './plan';

describe('plan', () => {
  it('estimatesThePriceAndLabelFromTheTier', () => {
    expect(planPrice('default_claude_max_20x')).toBe(200);
    expect(planPrice('default_claude_max_5x')).toBe(100);
    expect(planPrice('default_claude_pro')).toBe(20);
    expect(planPrice('enterprise')).toBeNull();
    expect(planPrice(null)).toBeNull();
    expect(planLabel({ claude_plan: 'Ultra', claude_tier: 'default_claude_max_20x' })).toBe(
      'Max 20x'
    );
    expect(planLabel({ claude_plan: 'Pro', claude_tier: 'default_claude_pro' })).toBe('Pro');
    expect(planLabel({ claude_plan: null, claude_tier: null })).toBeNull();
  });

  it('turnsLimitPointsIntoDollarsOfTheWeeklyAllowance', () => {
    expect(weeklyAllowance(200)).toBeCloseTo(46.15, 2);
    expect(costOf(31, 'default_claude_max_20x')).toBeCloseTo(14.31, 2);
    expect(costOf(null, 'default_claude_max_20x')).toBeNull();
    expect(costOf(10, null)).toBeNull();
  });

  it('measuresTheWeekElapsedAndListsItsDays', () => {
    const resets = '2026-11-15T09:00:00';
    const reset = new Date(resets).getTime();
    expect(weekElapsed(resets, reset - 7 * 24 * 3600 * 1000)).toBe(0);
    expect(weekElapsed(resets, reset - 3.5 * 24 * 3600 * 1000)).toBeCloseTo(50);
    expect(weekElapsed(resets, reset + 1000)).toBe(100);
    expect(windowDays(resets)).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
      '2026-11-11',
      '2026-11-12',
      '2026-11-13',
      '2026-11-14',
      '2026-11-15',
    ]);
  });

  it('splitsASharedAccountsCostByTokenShare', () => {
    const day = (fields: Partial<DailyUsage>): DailyUsage => ({
      user_id: 'u',
      day: '2026-11-11',
      input_tokens: 0,
      cache_write_tokens: 0,
      cache_read_tokens: 0,
      output_tokens: 0,
      requests: 1,
      seven_day_used: 20,
      limit_used: 10,
      account_weight: 0,
      account_members: 1,
      ...fields,
    });
    const tier = 'default_claude_max_20x';
    const whole = costOf(10, tier) ?? 0;

    expect(memberCost(day({ cache_read_tokens: 500 }), tier)).toBeCloseTo(whole);
    expect(
      memberCost(day({ cache_read_tokens: 250, account_weight: 1000, account_members: 3 }), tier)
    ).toBeCloseTo(whole / 4);
    expect(
      memberCost(day({ output_tokens: 150, account_weight: 1000, account_members: 2 }), tier)
    ).toBeCloseTo((whole * 750) / 1000);
    expect(memberCost(day({ account_members: 2 }), tier)).toBeCloseTo(whole / 2);
    expect(memberCost(day({ limit_used: null, account_members: 2 }), tier)).toBeNull();
  });

  it('roundsSharesSoTheyAddUpExactly', () => {
    const shares = roundToTotal([972_600, 13_700, 13_700], 100);
    expect(shares).toEqual([97.2, 1.4, 1.4]);
    expect(shares.reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    expect(roundToTotal([1, 1, 1], 83)).toEqual([27.7, 27.7, 27.6]);
    expect(roundToTotal([0, 0], 100)).toEqual([0, 0]);
  });
});

describe('budgetOf', () => {
  const now = Date.parse('2026-11-13T00:00:00Z');
  const resets = (days: number) => new Date(now + days * 86_400_000).toISOString();

  it('spreadsWhatIsLeftOverTheDaysLeft', () => {
    const budget = budgetOf(20, resets(5), now);
    expect(budget?.perDay).toBeCloseTo(16);
    expect(budget?.projected).toBeCloseTo(70);
    expect(budget?.runsOutAt).toBeNull();
  });

  it('saysWhenAFastWeekRunsOut', () => {
    const budget = budgetOf(60, resets(4), now);
    expect(budget?.projected).toBeCloseTo(140);
    expect(budget?.runsOutAt).toBe(now + 2 * 86_400_000);
  });

  it('waitsADayBeforeProjectingAndStopsAfterTheReset', () => {
    expect(budgetOf(10, resets(6.5), now)?.projected).toBeNull();
    expect(budgetOf(10, resets(0.5), now)?.perDay).toBe(90);
    expect(budgetOf(10, resets(-1), now)).toBeNull();
  });
});

describe('isHeavyDay', () => {
  const day = (fields: Partial<DailyUsage>): DailyUsage => ({
    user_id: 'a',
    day: '2026-11-13',
    input_tokens: 0,
    cache_write_tokens: 0,
    cache_read_tokens: 0,
    output_tokens: 0,
    requests: 0,
    seven_day_used: null,
    limit_used: null,
    account_weight: 0,
    account_members: 1,
    ...fields,
  });

  it('comparesAMembersShareOfTheDayWithTheirShareOfThePace', () => {
    expect(isHeavyDay(day({ limit_used: 20 }))).toBe(true);
    expect(isHeavyDay(day({ limit_used: 10 }))).toBe(false);
    const shared = { limit_used: 20, account_weight: 1_000, account_members: 2 };
    expect(memberLimitUsed(day({ ...shared, input_tokens: 400 }))).toBeCloseTo(8);
    expect(isHeavyDay(day({ ...shared, input_tokens: 400 }))).toBe(true);
    expect(isHeavyDay(day({ ...shared, input_tokens: 300 }))).toBe(false);
    expect(isHeavyDay(day({}))).toBe(false);
  });
});
