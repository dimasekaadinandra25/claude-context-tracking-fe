import { it, expect, describe } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { captureCsvDownloads } from 'src/test/csv-export';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { SessionsListView } from './sessions-list-view';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const session = {
  id: 's-1',
  user_id: 'u-1',
  user_name: 'Mia',
  machine: 'mia-laptop',
  project: 'billing',
  title: 'Fix invoices',
  model: 'claude-opus-4-1',
  models: ['claude-opus-4-1'],
  context_window: 200000,
  start_context: 20000,
  latest_context: 441234,
  peak_context: 900000,
  new_context: 48210,
  requests: 1234,
  compactions: 1,
  output_tokens: 31500,
  subagent_requests: 6,
  subagent_output_tokens: 4000,
  first_request_at: '2026-11-01T08:00:00Z',
  last_request_at: '2026-11-01T10:00:00Z',
  last_reported_at: '2026-11-01T10:01:00Z',
};

const GRID_READY = { timeout: 5000 };

function renderSessions(route?: string) {
  const backend = installFakeBackend({
    'GET /usage/v1/sessions': { status: 200, data: envelope([session]) },
    'GET /usage/v1/models': { status: 200, data: envelope([]) },
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <SessionsListView />
    </ReportRangeProvider>,
    route
  );
  return backend;
}

describe('SessionsListView', () => {
  it('hides the low-value columns by default', async () => {
    renderSessions();

    expect(
      await screen.findByRole('gridcell', { name: 'Fix invoices' }, GRID_READY)
    ).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '441.2K / 900K' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Output tokens' })).toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Requests' })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Compactions' })).not.toBeInTheDocument();
  });

  it('sessionsCsvExportsRawValues', async () => {
    const readCsv = captureCsvDownloads();
    renderSessions();

    await screen.findByRole('gridcell', { name: 'Fix invoices' }, GRID_READY);
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    const csv = await readCsv();

    expect(csv).toContain('48210');
    expect(csv).toContain('441234');
    expect(csv).toContain('900000');
    expect(csv).toContain('1234');
    expect(csv).toContain('2026-11-01T10:00:00Z');
    expect(csv).not.toMatch(/48\.2K|441\.2K/);
  });
});

describe('SessionsListView URL range', () => {
  it('readsRangeFromSearchParams', async () => {
    const from = '2026-11-02T02:00:00.000Z';
    const to = '2026-11-02T03:00:00.000Z';
    const backend = renderSessions(`/?from=${from}&to=${to}`);

    await waitFor(() =>
      expect(backend.requests).toContainEqual(
        expect.objectContaining({
          url: '/usage/v1/sessions',
          params: expect.objectContaining({ from, to }),
        })
      )
    );
  });
});
