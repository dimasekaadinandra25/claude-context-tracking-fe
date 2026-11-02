import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { Snackbar } from 'src/shared/ui/snackbar';
import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { AdminPeopleView } from './admin-people-view';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const mia = {
  id: 'u-1',
  email: 'mia@example.test',
  username: 'mia',
  full_name: 'Mia',
  is_active: true,
  is_email_verified: true,
  roles: ['member'],
  created_at: '2026-10-30T04:18:58Z',
  updated_at: '2026-10-30T04:18:58Z',
};

const emptyOverview = {
  people: [],
  total_new_context: 0,
  total_requests: 0,
  total_sessions: 0,
  active_people: 0,
};

const ok = (data: unknown) => ({ status: 200, data: envelope(data) });

function fakeBackend() {
  return installFakeBackend({
    'GET /core/v1/admin/users': ok([mia]),
    'GET /usage/v1/overview': ok(emptyOverview),
    'GET /core/v1/admin/users/u-1/api-keys': ok({ api_keys: [], total: 0, page: 1, limit: 100 }),
    'POST /core/v1/admin/users/u-1/api-keys': {
      status: 201,
      data: envelope({
        id: 'k-1',
        key: 'wiz_live_x_y',
        key_prefix: 'wiz_live_x...',
        name: 'laptop',
      }),
    },
  });
}

const activeKey = {
  id: 'k-1',
  key_prefix: 'wiz_live_x...',
  name: 'laptop',
  last_used_at: null,
  is_active: true,
  created_at: '2026-10-30T04:18:58Z',
};

const revokedKey = {
  ...activeKey,
  id: 'k-2',
  name: 'old-desktop',
  is_active: false,
  revoked_at: '2026-10-31T04:18:58Z',
};

function keysBackend(reveal: { status: number; data: unknown }) {
  return installFakeBackend({
    'GET /core/v1/admin/users': ok([mia]),
    'GET /usage/v1/overview': ok(emptyOverview),
    'GET /core/v1/admin/users/u-1/api-keys': ok({
      api_keys: [activeKey, revokedKey],
      total: 2,
      page: 1,
      limit: 100,
    }),
    'GET /core/v1/admin/api-keys/k-1/reveal': reveal,
  });
}

async function openKeysDrawer() {
  const user = userEvent.setup();
  renderWithAppProviders(
    <ReportRangeProvider>
      <AdminPeopleView />
      <Snackbar />
    </ReportRangeProvider>
  );
  await user.click(await screen.findByRole('button', { name: 'API keys' }));
  await screen.findByText('old-desktop');
  return user;
}

describe('AdminPeopleView API key copy', () => {
  it('copyKeyCopiesRevealedKey', async () => {
    keysBackend(ok({ key: 'wiz_live_x_y' }));
    const user = await openKeysDrawer();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');

    const copyButtons = screen.getAllByRole('button', { name: 'Copy API key' });
    expect(copyButtons).toHaveLength(1);
    await user.click(copyButtons[0]);

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('wiz_live_x_y'));
    expect(await screen.findByText('API key copied')).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain('wiz_live_x_y');
  });

  it('copyLegacyKeyShowsServerMessage', async () => {
    const message = 'key was issued before it could be revealed; issue a new key';
    keysBackend({ status: 409, data: { data: null, message } });
    const user = await openKeysDrawer();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');

    await user.click(screen.getByRole('button', { name: 'Copy API key' }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(writeText).not.toHaveBeenCalled();
  });
});

describe('AdminPeopleView API keys', () => {
  it('issuedKeyShownOnce', async () => {
    const backend = fakeBackend();
    const user = userEvent.setup();
    renderWithAppProviders(
      <ReportRangeProvider>
        <AdminPeopleView />
      </ReportRangeProvider>
    );

    await user.click(await screen.findByRole('button', { name: 'API keys' }));
    await user.click(await screen.findByRole('button', { name: 'Issue key' }));
    await user.type(await screen.findByRole('textbox', { name: /Key name/ }), 'laptop');
    await user.click(screen.getByRole('button', { name: 'Issue' }));

    expect(await screen.findByText('wiz_live_x_y')).toBeInTheDocument();
    expect(screen.getByText('This key will not be shown again.')).toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({ method: 'POST', body: { name: 'laptop' } })
    );

    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(await screen.findByRole('button', { name: 'Close' }));
    await user.click(await screen.findByRole('button', { name: 'API keys' }));
    await screen.findByRole('button', { name: 'Issue key' });

    await waitFor(() => expect(document.body.innerHTML).not.toContain('wiz_live_x_y'));
    document.querySelectorAll('input, textarea').forEach((el) => {
      expect((el as HTMLInputElement).value).not.toContain('wiz_live_x_y');
    });
  });
});
