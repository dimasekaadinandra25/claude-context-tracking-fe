import type { TFunction } from 'i18next';
import type { CostUsage } from '../types';

import { it, expect, describe } from 'vitest';

import { costsCsv } from './costs-csv';

const t = ((key: string) => key) as unknown as TFunction;

const row: CostUsage = {
  user_id: 'u1',
  full_name: 'Mia "M", Jr.',
  claude_email: 'team@example.test',
  claude_tier: 'default_claude_max_20x',
  project: 'line\nbreak',
  input_tokens: 10,
  cache_write_tokens: 20,
  cache_read_tokens: 30,
  output_tokens: 40,
  requests: 5,
  weight: 300,
  cost: 12.346,
};

describe('costsCsv', () => {
  it('writesHeadersInColumnOrder', () => {
    expect(costsCsv([], t)).toBe(
      'costs.col.person,costs.col.account,costs.col.plan,costs.col.project,costs.col.input,costs.col.cacheWrite,costs.col.cacheRead,costs.col.output,costs.col.requests,costs.col.weighted,costs.col.cost'
    );
  });

  it('quotesCommasQuotesAndNewlines', () => {
    const [, line] = costsCsv([row], t).split('\r\n');
    expect(line).toBe(
      '"Mia ""M"", Jr.",team@example.test,Max 20x,"line\nbreak",10,20,30,40,5,300,12.35'
    );
  });

  it('labelsPrivateProjectsAndMissingAccounts', () => {
    const [, line] = costsCsv(
      [{ ...row, full_name: 'Raka', project: '', claude_email: null, claude_tier: null, cost: 0 }],
      t
    ).split('\r\n');
    expect(line).toBe('Raka,,,projects.private,10,20,30,40,5,300,0.00');
  });
});
