import { it, expect, describe } from 'vitest';
import { within, screen, waitFor, fireEvent } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { captureCsvDownloads } from 'src/test/csv-export';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { OverviewView } from './overview-view';
import { lastDays, previousRange } from '../../../utils/range';
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
  total_input_tokens: 10000,
  total_cache_write_tokens: 10000,
  total_cache_read_tokens: 80000,
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
    expect(csv).not.toContain('Last 7 days');
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
    expect(screen.getByText('No members yet.')).toBeInTheDocument();
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

    const title = await screen.findByText('Members');
    const button = screen.getByRole('button', { name: 'Columns' });
    expect(title.closest('.MuiCardHeader-root')).toBe(button.closest('.MuiCardHeader-root'));
    expect(title.closest('.MuiCardHeader-root')).not.toBeNull();

    fireEvent.click(button);
    expect(await screen.findByText('Show/Hide All')).toBeInTheDocument();
  });
});

const previousOverview = {
  ...fullOverview,
  total_new_context: 100000,
  total_requests: 50,
  total_sessions: 0,
};

const isCurrent = (params: Record<string, string> | undefined) =>
  new Date(params?.to ?? 0) > new Date();

function renderWithRoutes(timeseries: (params: Record<string, string>) => unknown[]) {
  const backend = installFakeBackend({
    'GET /usage/v1/overview': ({ params }) => ({
      status: 200,
      data: envelope(isCurrent(params) ? fullOverview : previousOverview),
    }),
    'GET /usage/v1/timeseries': ({ params }) => ({
      status: 200,
      data: envelope(timeseries(params ?? {})),
    }),
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <OverviewView />
    </ReportRangeProvider>
  );
  return backend;
}

async function tileChange(title: string) {
  const heading = await screen.findByText(title, { selector: 'h6' });
  const tile = heading.closest('.MuiCard-root') as HTMLElement;
  return within(tile).getByText(/vs prev|—/).textContent;
}

describe('OverviewView compare periods', () => {
  it('kpiTilesShowChangeVsPreviousPeriod', async () => {
    renderWithRoutes(() => []);

    expect(await tileChange('New context')).toBe('▲ 20% vs prev 7d');
    expect(await tileChange('Requests')).toBe('▼ 20% vs prev 7d');
    expect(await tileChange('Sessions')).toBe('—');
    expect(await tileChange('Output tokens')).toBe('0% vs prev 7d');
    expect(await tileChange('Cache hit rate')).toBe('0% vs prev 7d');
  });

  it('quickRangeRefetchesBothPeriods', async () => {
    const backend = renderWithRoutes(() => []);

    fireEvent.click(await screen.findByRole('button', { name: '30d' }));

    const expected = lastDays(30);
    await waitFor(() =>
      expect(backend.requests).toContainEqual(
        expect.objectContaining({
          url: '/usage/v1/overview',
          params: expect.objectContaining({ from: expected.from.toISOString() }),
        })
      )
    );
    expect(backend.requests).toContainEqual(
      expect.objectContaining({
        url: '/usage/v1/overview',
        params: expect.objectContaining({ from: previousRange(expected).from.toISOString() }),
      })
    );
    expect(await tileChange('New context')).toBe('▲ 20% vs prev 30d');
    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('OverviewView activity heatmap and trends', () => {
  it('heatmapSumsHourlyBucketsByWeekdayAndHour', async () => {
    const backend = renderWithRoutes((params) =>
      params.interval === 'hour'
        ? [
            { bucket: '2026-11-02T09:00:00+07:00', key: 'u-1', new_context: 15000, requests: 1 },
            { bucket: '2026-11-02T09:00:00+07:00', key: 'u-2', new_context: 5000, requests: 1 },
          ]
        : []
    );

    expect(await screen.findByLabelText('Mon 09:00 · 20K')).toBeInTheDocument();
    expect(screen.getByLabelText('Sun 23:00 · 0')).toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({
        url: '/usage/v1/timeseries',
        params: expect.objectContaining({ interval: 'hour', group_by: 'user' }),
      })
    );
  });

  it('peopleTrendIgnoresSelectedRange', async () => {
    const week = lastDays(7).from.toISOString();
    const backend = renderWithRoutes(() => []);
    const weekCalls = () =>
      backend.requests.filter(
        (r) =>
          r.url === '/usage/v1/timeseries' &&
          r.params?.interval === 'day' &&
          r.params.group_by === 'user' &&
          r.params.from === week
      );

    expect(await screen.findByRole('columnheader', { name: 'Last 7 days' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '30d' }));

    await waitFor(() => expect(weekCalls()).toHaveLength(3));
  });
});

describe('OverviewView heatmap drill-down', () => {
  it('heatmapCellListsDatesWithHourSessionLinks', async () => {
    renderWithRoutes((params) =>
      params.interval === 'hour'
        ? [
            { bucket: '2026-10-26T09:00:00Z', key: 'u-1', new_context: 5000, requests: 1 },
            { bucket: '2026-11-02T09:00:00Z', key: 'u-1', new_context: 10000, requests: 1 },
            { bucket: '2026-11-02T09:00:00Z', key: 'u-2', new_context: 5000, requests: 1 },
          ]
        : []
    );

    fireEvent.click(await screen.findByLabelText('Mon 09:00 · 20K'));

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent('15K');
    expect(links[0]).toHaveAttribute(
      'href',
      '/dashboard/sessions?from=2026-11-02T09%3A00%3A00.000Z&to=2026-11-02T10%3A00%3A00.000Z'
    );
    expect(links[1]).toHaveTextContent('5K');
  });
});
