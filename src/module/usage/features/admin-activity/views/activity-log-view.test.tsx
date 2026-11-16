import type { RecordedRequest } from 'src/test/fake-backend';

import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { installFakeBackend } from 'src/test/fake-backend';

import { ActivityLogView } from './activity-log-view';

const entry = (id: string, fields: Record<string, unknown>) => ({
  id,
  actor_id: 'a-1',
  actor_email: 'boss@example.test',
  action: 'user.create',
  target_type: 'user',
  target_id: 'u-1',
  target_label: 'mia@example.test',
  summary: 'Created with the member role',
  ip: '127.0.0.1',
  created_at: '2026-11-16T03:12:45Z',
  ...fields,
});

const revoke = entry('e-2', {
  action: 'api_key.revoke',
  target_type: 'api_key',
  target_label: 'mia@example.test · laptop',
  summary: 'lost laptop',
});

function backend(total: number) {
  return installFakeBackend({
    'GET /core/v1/admin/audit-logs': (request: RecordedRequest) => ({
      status: 200,
      data: {
        data: request.params?.action ? [revoke] : [revoke, entry('e-1', {})],
        message: 'ok',
        meta: {
          pagination: { page: Number(request.params?.page), limit: 25, total, total_pages: 2 },
        },
      },
    }),
  });
}

const lastParams = ({ requests }: { requests: RecordedRequest[] }) =>
  requests[requests.length - 1]?.params;

describe('ActivityLogView', () => {
  it('listsEntriesNewestFirstAndFiltersByAction', async () => {
    const fake = backend(2);
    const user = userEvent.setup();
    renderWithAppProviders(<ActivityLogView />);

    expect(await screen.findByRole('cell', { name: 'Member created' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'mia@example.test · laptop' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'lost laptop' })).toBeInTheDocument();
    expect(screen.getAllByRole('cell', { name: 'boss@example.test' })).toHaveLength(2);
    expect(fake.requests[0].params).toEqual({ page: 1, limit: 25 });

    await user.click(screen.getByRole('combobox', { name: 'Action' }));
    await user.click(await screen.findByRole('option', { name: 'API key revoked' }));

    await waitFor(() =>
      expect(lastParams(fake)).toEqual({ page: 1, limit: 25, action: 'api_key.revoke' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('cell', { name: 'Member created' })).not.toBeInTheDocument()
    );
  });

  it('pagesThroughEntries', async () => {
    const fake = backend(30);
    const user = userEvent.setup();
    renderWithAppProviders(<ActivityLogView />);

    expect(await screen.findByText('1–25 of 30')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go to next page' }));

    await waitFor(() => expect(lastParams(fake)).toEqual({ page: 2, limit: 25 }));
    expect(await screen.findByText('26–30 of 30')).toBeInTheDocument();
  });
});
