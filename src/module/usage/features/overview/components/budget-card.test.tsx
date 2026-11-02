import { screen } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';

import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { BudgetCard } from './budget-card';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const budget = {
  full_name: 'Mia',
  email: 'mia@example.test',
  month_start: '2026-11-01T00:00:00+07:00',
};

function renderBudgets(budgets: unknown[], userId?: string) {
  const backend = installFakeBackend({
    'GET /usage/v1/budgets': { status: 200, data: envelope(budgets) },
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <BudgetCard userId={userId} />
    </ReportRangeProvider>
  );
  return backend;
}

describe('BudgetCard', () => {
  it('budgetCardShowsUsageAndWarning', async () => {
    const backend = renderBudgets([
      { ...budget, user_id: 'u-1', monthly_new_context: 10000000, used_new_context: 7600000 },
      {
        ...budget,
        user_id: 'u-2',
        full_name: 'Raka',
        monthly_new_context: 1000000,
        used_new_context: 850000,
      },
      { ...budget, user_id: 'u-3', full_name: 'Sari', monthly_new_context: null },
    ]);

    expect(await screen.findByText('7.6M of 10M · 76%')).toBeInTheDocument();
    expect(screen.getByText('850K of 1M · 85%')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Near budget')).toHaveLength(1);
    expect(screen.queryByText('Sari')).not.toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({
        url: '/usage/v1/budgets',
        params: { tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
      })
    );
  });

  it('budgetCardShowsOverBudget', async () => {
    renderBudgets([
      { ...budget, user_id: 'u-1', monthly_new_context: 1000000, used_new_context: 1200000 },
    ]);

    expect(await screen.findByText('1.2M of 1M · 120%')).toBeInTheDocument();
    expect(screen.getByLabelText('Over budget')).toBeInTheDocument();
  });

  it('budgetCardComparesTheUnroundedRatio', async () => {
    renderBudgets([
      { ...budget, user_id: 'u-1', monthly_new_context: 1000000, used_new_context: 995000 },
    ]);

    expect(await screen.findByText('995K of 1M · 100%')).toBeInTheDocument();
    expect(screen.getByLabelText('Near budget')).toBeInTheDocument();
    expect(screen.queryByLabelText('Over budget')).not.toBeInTheDocument();
  });

  it('budgetCardShowsOnlyThePerson', async () => {
    renderBudgets(
      [
        { ...budget, user_id: 'u-1', monthly_new_context: 10000000, used_new_context: 7600000 },
        {
          ...budget,
          user_id: 'u-2',
          full_name: 'Raka',
          monthly_new_context: 1000000,
          used_new_context: 1,
        },
      ],
      'u-2'
    );

    expect(await screen.findByText('Raka')).toBeInTheDocument();
    expect(screen.queryByText('Mia')).not.toBeInTheDocument();
  });

  it('budgetCardHiddenWhenPersonHasNoBudget', async () => {
    const backend = renderBudgets(
      [{ ...budget, user_id: 'u-1', monthly_new_context: 10000000, used_new_context: 1 }],
      'u-2'
    );

    await vi.waitFor(() => expect(backend.requests.length).toBeGreaterThan(0));
    expect(screen.queryByText('Monthly budget')).not.toBeInTheDocument();
    expect(
      screen.queryByText('No budgets yet. Set budgets in Admin → Members.')
    ).not.toBeInTheDocument();
  });

  it('budgetCardShowsHintWithoutBudgets', async () => {
    renderBudgets([{ ...budget, user_id: 'u-1', monthly_new_context: null, used_new_context: 0 }]);

    expect(
      await screen.findByText('No budgets yet. Set budgets in Admin → Members.')
    ).toBeInTheDocument();
  });
});
