import { Route, Routes } from 'react-router';
import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { SessionDetailView } from './session-detail-view';

const session = {
  id: 's-1',
  user_id: 'u-1',
  machine: 'mia-laptop',
  project: 'billing',
  title: 'Fix invoices',
  model: 'claude-opus-4-1',
  models: ['claude-opus-4-1'],
  context_window: 200000,
  start_context: 20000,
  latest_context: 40000,
  peak_context: 90000,
  new_context: 48210,
  requests: 12,
  compactions: 0,
  first_request_at: '2026-11-01T08:00:00Z',
  last_request_at: '2026-11-01T10:00:00Z',
  last_reported_at: '2026-11-01T10:01:00Z',
};

function renderDetail(overhead: unknown) {
  installFakeBackend({
    'GET /usage/v1/sessions/s-1': {
      status: 200,
      data: envelope({ session, user_name: 'Mia', models: session.models, hours: [], overhead }),
    },
  });
  renderWithAppProviders(
    <Routes>
      <Route path="/sessions/:id" element={<SessionDetailView />} />
    </Routes>,
    '/sessions/s-1'
  );
}

const valueOf = (label: string) => screen.getByText(label).nextSibling?.textContent;

describe('SessionDetailView overhead', () => {
  it('showsOverheadBreakdownWithTotal', async () => {
    renderDetail({
      system_tokens: 8000,
      memory_tokens: 2000,
      agents_tokens: 1500,
      skills_tokens: 500,
    });

    expect(await screen.findByText('Overhead per request')).toBeInTheDocument();
    expect(valueOf('System prompt & tools')).toBe('8K');
    expect(valueOf('Memory files')).toBe('2K');
    expect(valueOf('Agents')).toBe('1.5K');
    expect(valueOf('Skills')).toBe('500');
    expect(valueOf('Total')).toBe('12K');
  });

  it('hidesOverheadWhenMissing', async () => {
    renderDetail(undefined);

    expect(await screen.findByText('Fix invoices', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.queryByText('Overhead per request')).not.toBeInTheDocument();
  });
});
