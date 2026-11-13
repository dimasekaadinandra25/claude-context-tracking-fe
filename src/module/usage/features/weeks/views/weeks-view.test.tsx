import type { WeekUsage } from 'src/module/usage/types';

import { it, expect, describe } from 'vitest';

import { weekCost, groupWeeks } from './weeks-view';

const row = (fields: Partial<WeekUsage>): WeekUsage => ({
  account: 'team@claude.test',
  claude_email: 'team@claude.test',
  claude_tier: 'default_claude_max_20x',
  resets_at: '2026-11-18T15:00:00Z',
  used: 50,
  top_model: 'claude-opus-5-5',
  user_id: 'a',
  full_name: 'Mia',
  input_tokens: 0,
  output_tokens: 0,
  requests: 0,
  weight: 300,
  ...fields,
});

describe('weeks', () => {
  it('groupsMembersUnderTheirWindowAndPricesTheWeek', () => {
    const weeks = groupWeeks([
      row({}),
      row({ user_id: 'b', full_name: 'Raka', weight: 100 }),
      row({ resets_at: '2026-11-11T15:00:00Z', used: 83, user_id: null }),
    ]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].members.map((member) => member.name)).toEqual(['Mia', 'Raka']);
    expect(weeks[1].members).toEqual([]);
    expect(weekCost(weeks[0])).toBeCloseTo(23.08, 2);
    expect(weekCost({ ...weeks[0], tier: null })).toBeNull();
  });
});
