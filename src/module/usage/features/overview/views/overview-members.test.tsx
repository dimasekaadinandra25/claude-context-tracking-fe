import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

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

const fullOverview = {
  people: [mia],
  total_new_context: 120000,
  total_requests: 40,
  total_sessions: 2,
  active_people: 1,
};

function renderPeople(people: Record<string, unknown>[]) {
  installFakeBackend({
    'GET /usage/v1/overview': {
      status: 200,
      data: envelope({ ...fullOverview, people }),
    },
    'GET /usage/v1/timeseries': { status: 200, data: envelope([]) },
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <OverviewView />
    </ReportRangeProvider>
  );
}

const justSynced = () => new Date().toISOString();

describe('OverviewView app version and sync', () => {
  it('outdatedChipShowsLatestVersion', async () => {
    renderPeople([
      { ...mia, last_synced_at: justSynced(), app_version: '1.9.0' },
      {
        ...mia,
        user_id: 'u-2',
        full_name: 'Raka',
        last_synced_at: justSynced(),
        app_version: '1.10.0',
      },
      {
        ...mia,
        user_id: 'u-3',
        full_name: 'Sari',
        last_synced_at: justSynced(),
        app_version: null,
      },
    ]);

    expect(await screen.findByText('1.10.0')).toBeInTheDocument();
    expect(screen.getAllByText('Outdated')).toHaveLength(1);
    expect(screen.getByLabelText('Latest is 1.10.0')).toHaveTextContent('Outdated');
    expect(
      screen.getAllByRole('gridcell', { name: '—' }).filter((c) => c.dataset.field === 'app_version')
    ).toHaveLength(1);
  });

  it('staleSyncShowsWarningIcon', async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
    renderPeople([
      { ...mia, last_synced_at: threeDaysAgo, app_version: '1.0.0' },
      { ...mia, user_id: 'u-2', full_name: 'Raka', last_synced_at: justSynced() },
      { ...mia, user_id: 'u-3', full_name: 'Sari', last_synced_at: null },
    ]);

    expect(await screen.findByLabelText('Not synced for 3 days')).toBeInTheDocument();
    expect(screen.getByLabelText('Never synced')).toBeInTheDocument();
    expect(screen.queryAllByLabelText(/^Not synced for/)).toHaveLength(1);
  });

  it('flagsNeverSyncedEvenWithoutUsageAndSkipsInactiveMembers', async () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString();
    renderPeople([
      { ...mia, new_context: 0, requests: 0, last_synced_at: null },
      { ...mia, user_id: 'u-2', full_name: 'Raka', last_synced_at: null, is_active: false },
      {
        ...mia,
        user_id: 'u-3',
        full_name: 'Sari',
        last_synced_at: threeDaysAgo,
        is_active: false,
      },
    ]);

    expect(await screen.findByText('Raka')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Never synced')).toHaveLength(1);
    expect(screen.queryAllByLabelText(/^Not synced for/)).toHaveLength(0);
  });

  it('memberNameIsALinkToTheirPage', async () => {
    renderPeople([{ ...mia, last_synced_at: justSynced() }]);

    expect(await screen.findByRole('link', { name: 'Mia' })).toHaveAttribute(
      'href',
      '/dashboard/person/u-1'
    );
  });
});
