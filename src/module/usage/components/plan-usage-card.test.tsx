import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { PlanUsageCard } from './plan-usage-card';
import { ReportRangeProvider } from '../hooks/use-report-range';

const person = (fields: Partial<OverviewPerson>) =>
  ({
    full_name: '',
    email: '',
    claude_email: null,
    claude_plan: null,
    claude_tier: null,
    is_active: true,
    ...fields,
  }) as OverviewPerson;

const today = dayjs().format('YYYY-MM-DD');

const day = (userId: string, fields: Record<string, number | null>) => ({
  user_id: userId,
  day: today,
  input_tokens: 0,
  cache_write_tokens: 0,
  cache_read_tokens: 0,
  output_tokens: 0,
  requests: 1,
  seven_day_used: null,
  limit_used: null,
  account_weight: 0,
  account_members: 1,
  ...fields,
});

describe('PlanUsageCard', () => {
  it('showsTokensLimitCostShareAndUnusedMembers', async () => {
    installFakeBackend({
      'GET /usage/v1/daily': {
        status: 200,
        data: envelope([
          day('a', {
            input_tokens: 1_000_000,
            cache_read_tokens: 2_000_000,
            output_tokens: 50_000,
            limit_used: 10,
            seven_day_used: 31,
          }),
          day('b', { input_tokens: 750_000, output_tokens: 50_000 }),
        ]),
      },
    });
    renderWithAppProviders(
      <ReportRangeProvider>
        <PlanUsageCard
          people={[
            person({
              user_id: 'a',
              full_name: 'Naufal',
              claude_email: 'naufal@claude.test',
              claude_tier: 'default_claude_max_20x',
            }),
            person({ user_id: 'b', full_name: 'Rizqi' }),
            person({ user_id: 'c', full_name: 'Tama' }),
          ]}
        />
      </ReportRangeProvider>
    );

    expect(await screen.findByText('Naufal')).toBeInTheDocument();
    expect(screen.getByText('Max 20x')).toBeInTheDocument();
    expect(screen.getByText('naufal@claude.test')).toBeInTheDocument();
    expect(screen.getAllByText('1 req')).toHaveLength(2);
    expect(screen.getByText('3M in')).toBeInTheDocument();
    expect(screen.getByText('+10%')).toBeInTheDocument();
    expect(screen.getAllByText('$4.62')).toHaveLength(2);
    expect(
      screen.getByText((76.5).toLocaleString(undefined, { minimumFractionDigits: 1 }) + '%')
    ).toBeInTheDocument();
    expect(screen.getByText('Not used: Tama')).toBeInTheDocument();
  });

  it('explainsAnEmptyWeek', async () => {
    installFakeBackend({ 'GET /usage/v1/daily': { status: 200, data: envelope([]) } });
    renderWithAppProviders(
      <ReportRangeProvider>
        <PlanUsageCard people={[person({ user_id: 'a', full_name: 'Naufal' })]} />
      </ReportRangeProvider>
    );

    expect(await screen.findByText('No usage in the last 7 days.')).toBeInTheDocument();
  });
});
