import { it, expect, describe } from 'vitest';
import { within, screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { OverviewView } from './overview-view';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const mia = {
  user_id: 'u-1',
  full_name: 'Mia',
  email: 'mia@example.test',
  current_model: 'claude-opus-4-1',
  new_context: 120000,
  requests: 40,
  sessions: 2,
  last_request_at: '2026-11-01T10:00:00Z',
  last_synced_at: '2026-11-01T10:05:00Z',
};

const totals = {
  total_new_context: 120000,
  total_requests: 40,
  total_sessions: 2,
  active_people: 1,
};

const overview = {
  ...totals,
  people: [
    {
      ...mia,
      input_tokens: 1000,
      cache_write_tokens: 2000,
      cache_read_tokens: 7000,
      sessions_near_full: 2,
      compactions: 3,
    },
  ],
  total_input_tokens: 10000,
  total_cache_write_tokens: 10000,
  total_cache_read_tokens: 80000,
};

function renderOverview(data: unknown) {
  installFakeBackend({
    'GET /usage/v1/overview': { status: 200, data: envelope(data) },
    'GET /usage/v1/timeseries': { status: 200, data: envelope([]) },
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <OverviewView />
    </ReportRangeProvider>
  );
}

const cacheTile = () => screen.findByText('Cache hit rate', { selector: 'h6' });

describe('OverviewView cache hit rate and context pressure', () => {
  it('showsCacheHitRateTileAndMembersColumn', async () => {
    renderOverview(overview);

    const heading = await cacheTile();
    const tile = heading.closest('.MuiCard-root') as HTMLElement;
    expect(within(tile).getByRole('heading', { level: 3 })).toHaveTextContent('80%');
    expect(heading).toHaveAttribute(
      'aria-label',
      'Share of input served from prompt cache. Higher means less fresh context per request.'
    );
    expect(await screen.findByRole('columnheader', { name: 'Cache hit rate' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '70%' })).toBeInTheDocument();
  });

  it('showsDashAndEmptyPressureForAnOlderServer', async () => {
    renderOverview({ ...totals, people: [mia] });

    const tile = (await cacheTile()).closest('.MuiCard-root') as HTMLElement;
    expect(within(tile).getByRole('heading', { level: 3 })).toHaveTextContent('—');
    expect(
      screen.getByText('No sessions came close to their context limit in this range.')
    ).toBeInTheDocument();
  });

  it('listsMembersUnderContextPressure', async () => {
    renderOverview(overview);

    const card = (await screen.findByText('Context pressure')).closest(
      '.MuiCard-root'
    ) as HTMLElement;
    expect(within(card).getByRole('row', { name: 'Mia 2 3' })).toBeInTheDocument();
  });
});
