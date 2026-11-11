import type { DailyUsage, ModelUsage, OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { installFakeBackend } from 'src/test/fake-backend';
import { modelLabel } from 'src/module/usage/utils/format';

import { PlanReport, mainAccount } from './plan-report';

const person = (fields: Partial<OverviewPerson>) =>
  ({
    full_name: '',
    email: '',
    claude_email: null,
    claude_plan: null,
    claude_tier: null,
    seven_day_used: null,
    seven_day_resets_at: null,
    limits_captured_at: null,
    five_hour_used: null,
    five_hour_resets_at: null,
    is_active: true,
    ...fields,
  }) as OverviewPerson;

const resets = dayjs().add(2, 'day').toISOString();
const shared = {
  claude_email: 'team@claude.test',
  claude_tier: 'default_claude_max_20x',
  seven_day_used: 31,
  seven_day_resets_at: resets,
};
const owner = person({ user_id: 'a', full_name: 'Owner', ...shared });
const guest = person({ user_id: 'b', full_name: 'Guest', ...shared });
const solo = person({
  user_id: 'c',
  full_name: 'Solo',
  claude_email: 'solo@claude.test',
  seven_day_used: 50,
  seven_day_resets_at: resets,
});

const model = (name: string, requests: number, input: number): ModelUsage => ({
  model: name,
  new_context: 0,
  requests,
  sessions: 1,
  output_tokens: 0,
  subagent_requests: 0,
  subagent_output_tokens: 0,
  input_tokens: input,
  cache_write_tokens: 0,
  cache_read_tokens: 0,
});

describe('PlanReport', () => {
  it('namesModelsLikeClaudeDoes', () => {
    expect(modelLabel('claude-opus-5-5')).toBe('Opus 5.5');
    expect(modelLabel('claude-fable-5-1')).toBe('Fable 5.1');
    expect(modelLabel('claude-haiku-4-5-20251001')).toBe('Haiku 4.5');
  });

  it('picksTheAccountMostMembersShare', () => {
    expect(mainAccount([solo, owner, guest])?.claude_email).toBe('team@claude.test');
    expect(mainAccount([person({ user_id: 'x' })])).toBeNull();
  });

  it('rendersAccountLimitDailyBarsAndMembers', async () => {
    installFakeBackend({});
    const today = dayjs().format('YYYY-MM-DD');
    const daily: DailyUsage[] = [
      {
        user_id: 'a',
        day: today,
        input_tokens: 2_000_000,
        cache_write_tokens: 0,
        cache_read_tokens: 0,
        output_tokens: 0,
        requests: 3,
        seven_day_used: 31,
        limit_used: 12,
        account_weight: 2_000_000,
        account_members: 2,
      },
    ];
    renderWithAppProviders(
      <PlanReport
        report={{
          people: [owner, guest],
          account: owner,
          days: [today],
          daily,
          models: [model('claude-haiku-5-5', 2, 1_000), model('claude-opus-5-5', 40, 3_000)],
        }}
      />
    );

    expect(await screen.findByText('Claude Usage')).toBeInTheDocument();
    expect(screen.getAllByText('team@claude.test')).toHaveLength(1);
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Not used: Guest')).toBeInTheDocument();
    expect(screen.getAllByText('$5.54').length).toBeGreaterThan(0);
    expect(screen.queryByText('By model')).not.toBeInTheDocument();
    expect(screen.getByText('└ Opus 5.5')).toBeInTheDocument();
    expect(screen.getByText('└ Haiku 5.5')).toBeInTheDocument();
    expect(
      screen.getByText(`${(75).toLocaleString(undefined, { minimumFractionDigits: 1 })}%`)
    ).toBeInTheDocument();
  });
});
