import { it, expect, describe } from 'vitest';
import { within, screen, fireEvent } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { captureCsvDownloads } from 'src/test/csv-export';
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
  people: [{ ...mia, output_tokens: 31000, subagent_requests: 7, subagent_output_tokens: 9000 }],
  total_new_context: 120000,
  total_requests: 40,
  total_sessions: 2,
  active_people: 1,
  total_output_tokens: 48200,
  total_subagent_requests: 1234,
  total_subagent_output_tokens: 9000,
};

const oldServerOverview = {
  people: [mia],
  total_new_context: 120000,
  total_requests: 40,
  total_sessions: 2,
  active_people: 1,
};

function renderOverview(overview: unknown) {
  installFakeBackend({
    'GET /usage/v1/overview': { status: 200, data: envelope(overview) },
    'GET /usage/v1/timeseries': { status: 200, data: envelope([]) },
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <OverviewView />
    </ReportRangeProvider>
  );
}

async function tileValue(title: string) {
  const heading = await screen.findByText(title, { selector: 'h6' });
  const tile = heading.closest('.MuiCard-root') as HTMLElement;
  return within(tile).getByRole('heading', { level: 3 }).textContent;
}

describe('OverviewView output and subagent usage', () => {
  it('overviewShowsOutputAndSubagentTiles', async () => {
    renderOverview(fullOverview);

    expect(await tileValue('Output tokens')).toBe('48.2K');
    expect(await tileValue('Subagent requests')).toBe('1,234');
    expect(await screen.findByRole('columnheader', { name: 'Output tokens' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Subagent requests' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Subagent output' })).toBeInTheDocument();
    expect(screen.getByRole('gridcell', { name: '31K' })).toBeInTheDocument();
  });

  it('missingFieldsTreatedAsZero', async () => {
    renderOverview(oldServerOverview);

    expect(await tileValue('Output tokens')).toBe('0');
    expect(await tileValue('Subagent requests')).toBe('0');
    expect(document.body.textContent).not.toMatch(/NaN|undefined/);
  });
});

describe('OverviewView CSV export', () => {
  it('peopleCsvExportsRawValues', async () => {
    const readCsv = captureCsvDownloads();
    renderOverview(fullOverview);

    fireEvent.click(await screen.findByRole('button', { name: 'Export CSV' }));
    const csv = await readCsv();

    expect(csv).toContain('Mia');
    expect(csv).toContain('120000');
    expect(csv).toContain('31000');
    expect(csv).toContain('2026-11-01T10:00:00Z');
    expect(csv).not.toContain('120K');
  });
});

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
