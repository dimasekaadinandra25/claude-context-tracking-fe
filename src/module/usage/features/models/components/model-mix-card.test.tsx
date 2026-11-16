import type { RecordedRequest } from 'src/test/fake-backend';

import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { installFakeBackend } from 'src/test/fake-backend';

import { ModelMixCard } from './model-mix-card';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const smallOpus = (id: string) => ({
  id,
  user_id: 'u-1',
  user_name: 'Mia',
  machine: 'laptop',
  project: 'billing',
  title: `Session ${id}`,
  model: 'claude-opus-5-5',
  models: ['claude-opus-5-5'],
  context_window: 200000,
  start_context: 0,
  latest_context: 0,
  peak_context: 0,
  new_context: 0,
  requests: 5,
  compactions: 0,
  input_tokens: 1_000_000,
  cache_write_tokens: 0,
  cache_read_tokens: 0,
  output_tokens: 1_000,
  subagent_requests: 0,
  subagent_output_tokens: 0,
  first_request_at: '2026-11-01T08:00:00Z',
  last_request_at: '2026-11-01T09:00:00Z',
  last_reported_at: '2026-11-01T09:00:00Z',
});

function renderCard(totalPages: number) {
  const backend = installFakeBackend({
    'GET /usage/v1/sessions': (request: RecordedRequest) => {
      const page = Number(request.params?.page);
      return {
        status: 200,
        data: {
          data: [smallOpus(`p${page}`)],
          message: 'ok',
          meta: { pagination: { page, limit: 100, total: totalPages, total_pages: totalPages } },
        },
      };
    },
  });
  renderWithAppProviders(
    <ReportRangeProvider>
      <ModelMixCard />
    </ReportRangeProvider>
  );
  return backend;
}

describe('ModelMixCard', () => {
  it('readsEveryPageOfTheRange', async () => {
    const backend = renderCard(3);

    expect(await screen.findByText(/^3 small Opus sessions/)).toBeInTheDocument();
    expect(backend.requests.map((r) => [r.params?.page, r.params?.per_page])).toEqual([
      ['1', '100'],
      ['2', '100'],
      ['3', '100'],
    ]);
    expect(screen.queryByText(/most recent sessions were checked/)).not.toBeInTheDocument();
  });

  it('saysSoWhenThePageCapIsReached', async () => {
    const backend = renderCard(50);

    expect(
      await screen.findByText(/Only the 20 most recent sessions were checked\./)
    ).toBeInTheDocument();
    expect(backend.requests).toHaveLength(20);
  });
});
