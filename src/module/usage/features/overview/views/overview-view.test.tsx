import { it, expect, describe } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { OverviewView } from './overview-view';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const emptyOverview = {
  people: [],
  total_new_context: 0,
  total_requests: 0,
  total_sessions: 0,
  active_people: 0,
};

describe('OverviewView', () => {
  it('overviewShowsEmptyState', async () => {
    const backend = installFakeBackend({
      'GET /usage/v1/overview': { status: 200, data: envelope(emptyOverview) },
      'GET /usage/v1/timeseries': { status: 200, data: envelope([]) },
    });

    const { container } = renderWithAppProviders(
      <ReportRangeProvider>
        <OverviewView />
      </ReportRangeProvider>
    );

    expect(await screen.findByText('No usage in this range yet.')).toBeInTheDocument();
    expect(screen.getByText('No people yet.')).toBeInTheDocument();
    expect(container.querySelector('.MuiChartsSurface-root')).toBeNull();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(backend.requests.map((r) => r.url)).toEqual(
      expect.arrayContaining(['/usage/v1/overview', '/usage/v1/timeseries'])
    );
  });

  it('peopleTitleAndColumnsButtonShareOneHeader', async () => {
    installFakeBackend({
      'GET /usage/v1/overview': { status: 200, data: envelope(emptyOverview) },
      'GET /usage/v1/timeseries': { status: 200, data: envelope([]) },
    });

    renderWithAppProviders(
      <ReportRangeProvider>
        <OverviewView />
      </ReportRangeProvider>
    );

    const title = await screen.findByText('People');
    const button = screen.getByRole('button', { name: 'Columns' });
    expect(title.closest('.MuiCardHeader-root')).toBe(button.closest('.MuiCardHeader-root'));
    expect(title.closest('.MuiCardHeader-root')).not.toBeNull();

    fireEvent.click(button);
    expect(await screen.findByText('Show/Hide All')).toBeInTheDocument();
  });
});
