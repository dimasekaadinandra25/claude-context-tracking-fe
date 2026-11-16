import type { OverviewPerson } from 'src/module/usage/types';

import dayjs from 'dayjs';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { act, screen, waitFor } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { PlanUsageCard } from './plan-usage-card';
import { REFRESH_INTERVAL_MS } from '../hooks/use-fetch';
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
    expect(screen.queryByText('naufal@claude.test')).not.toBeInTheDocument();
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

  it('showsAFetchErrorInsteadOfAnEmptyWeek', async () => {
    installFakeBackend({
      'GET /usage/v1/daily': { status: 500, data: { message: 'daily is down' } },
    });
    renderWithAppProviders(
      <ReportRangeProvider>
        <PlanUsageCard people={[person({ user_id: 'a', full_name: 'Naufal' })]} />
      </ReportRangeProvider>
    );

    expect(await screen.findByText('daily is down')).toBeInTheDocument();
    expect(screen.queryByText('No usage in the last 7 days.')).not.toBeInTheDocument();
  });

  describe('at midnight', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('rollsTheWeekOverToTheNewDay', async () => {
      vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
      vi.setSystemTime(new Date(2026, 10, 16, 23, 59));
      const backend = installFakeBackend({
        'GET /usage/v1/daily': { status: 200, data: envelope([]) },
      });
      renderWithAppProviders(
        <ReportRangeProvider>
          <PlanUsageCard people={[person({ user_id: 'a', full_name: 'Naufal' })]} />
        </ReportRangeProvider>
      );
      await waitFor(() =>
        expect(backend.requests.map((r) => r.params?.from)).toContain(
          new Date(2026, 10, 10).toISOString()
        )
      );

      vi.setSystemTime(new Date(2026, 10, 17, 0, 1));
      act(() => {
        vi.advanceTimersByTime(REFRESH_INTERVAL_MS);
      });

      await waitFor(() =>
        expect(backend.requests.map((r) => r.params?.from)).toContain(
          new Date(2026, 10, 11).toISOString()
        )
      );
    });
  });
});
