import type { UsageSession } from '../types';

import { it, expect, describe } from 'vitest';

import { SONNET, opusPrice, sessionCost, modelMixTip } from './model-mix';

function session(overrides: Partial<UsageSession>): UsageSession {
  return {
    id: 's-1',
    user_id: 'u-1',
    machine: 'laptop',
    project: 'billing',
    title: 'Fix invoices',
    model: 'claude-opus-5-5',
    context_window: 200000,
    start_context: 0,
    latest_context: 0,
    peak_context: 0,
    new_context: 0,
    requests: 10,
    compactions: 0,
    first_request_at: '2026-11-01T08:00:00Z',
    last_request_at: '2026-11-01T09:00:00Z',
    last_reported_at: '2026-11-01T09:00:00Z',
    models: ['claude-opus-5-5'],
    input_tokens: 1_000_000,
    cache_write_tokens: 0,
    cache_read_tokens: 0,
    output_tokens: 10_000,
    subagent_requests: 0,
    subagent_output_tokens: 0,
    ...overrides,
  };
}

describe('model mix', () => {
  it('pricesOpusModelsByVersion', () => {
    expect(opusPrice('claude-opus-5-5')).toEqual({ input: 4, output: 20 });
    expect(opusPrice('claude-opus-5')).toEqual({ input: 5, output: 25 });
    expect(opusPrice('claude-opus-4-1-20250805')).toEqual({ input: 5, output: 25 });
    expect(opusPrice('claude-sonnet-5-5')).toBeNull();
  });

  it('billsCacheWritesAndReadsAgainstTheInputPrice', () => {
    const row = session({
      input_tokens: 1_000_000,
      cache_write_tokens: 1_000_000,
      cache_read_tokens: 1_000_000,
      output_tokens: 500_000,
      subagent_output_tokens: 500_000,
    });

    expect(sessionCost(row, SONNET)).toBeCloseTo(2 + 2.5 + 0.2 + 10);
  });

  it('findsSmallOpusSessionsAndTheirSonnetSaving', () => {
    const tip = modelMixTip([
      session({ id: 'small-55' }),
      session({ id: 'small-5', model: 'claude-opus-5', models: ['claude-opus-5'] }),
      session({ id: 'long', requests: 16 }),
      session({ id: 'wordy', output_tokens: 15_000, subagent_output_tokens: 6_000 }),
      session({ id: 'sonnet', model: 'claude-sonnet-5', models: ['claude-sonnet-5'] }),
    ]);

    expect(tip.opusSessions).toBe(4);
    expect(tip.sessions.map((row) => row.session.id)).toEqual(['small-5', 'small-55']);
    expect(tip.sessions[0].cost).toBeCloseTo(5.25);
    expect(tip.sessions[0].saving).toBeCloseTo(3.15);
    expect(tip.cost).toBeCloseTo(4.2 + 5.25);
    expect(tip.saving).toBeCloseTo(2.1 + 3.15);
  });
});
