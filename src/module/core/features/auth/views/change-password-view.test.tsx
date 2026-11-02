import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { makeJwtExpiringIn } from 'src/test/jwt';
import { Snackbar } from 'src/shared/ui/snackbar';
import { testUser, meResponse } from 'src/test/auth-fixtures';
import { envelope, installFakeBackend } from 'src/test/fake-backend';
import { AuthStatusProbe, renderWithAppProviders } from 'src/test/render';

import { setTokens } from '../context/jwt';
import { ChangePasswordView } from './change-password-view';

const ME = 'GET /core/v1/auth/me';
const CHANGE = 'POST /core/v1/auth/change-password';

const me = (mustChange: boolean) => ({
  status: 200,
  data: envelope(meResponse({ user: { ...testUser, must_change_password: mustChange } })),
});

async function renderView(routes: Parameters<typeof installFakeBackend>[0]) {
  setTokens(makeJwtExpiringIn(600), 'refresh-1');
  const backend = installFakeBackend(routes);
  renderWithAppProviders(
    <>
      <ChangePasswordView />
      <AuthStatusProbe />
      <Snackbar />
    </>,
    '/dashboard/account/password'
  );
  await screen.findByText('session: Rina Kusuma');
  return backend;
}

async function fill(current: string, next: string, confirm: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Current password'), current);
  await user.type(screen.getByLabelText('New password'), next);
  await user.type(screen.getByLabelText('Confirm new password'), confirm);
  await user.click(screen.getByRole('button', { name: 'Change password' }));
}

describe('ChangePasswordView', () => {
  it('changePasswordSubmits', async () => {
    let changed = false;
    const backend = await renderView({
      [ME]: () => me(!changed),
      [CHANGE]: () => {
        changed = true;
        return { status: 200, data: envelope(null, 'Password changed successfully') };
      },
    });
    expect(screen.getByText('Please change your password to continue.')).toBeInTheDocument();

    await fill('old-secret-1', 'new-secret-1', 'new-secret-1');

    expect(await screen.findByText('Password changed')).toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({
        url: '/core/v1/auth/change-password',
        body: { current_password: 'old-secret-1', new_password: 'new-secret-1' },
      })
    );
    await waitFor(() =>
      expect(screen.queryByText('Please change your password to continue.')).not.toBeInTheDocument()
    );
  });
});

describe('ChangePasswordView validation and errors', () => {
  it('rejects a mismatched confirmation without calling the server', async () => {
    const backend = await renderView({ [ME]: me(false) });

    await fill('old-secret-1', 'new-secret-1', 'new-secret-2');

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(backend.requests.map((r) => r.url)).not.toContain('/core/v1/auth/change-password');
  });

  it('rejects a short new password without calling the server', async () => {
    const backend = await renderView({ [ME]: me(false) });

    await fill('old-secret-1', 'short', 'short');

    expect(await screen.findByText('Password must be at least 8 characters!')).toBeInTheDocument();
    expect(backend.requests.map((r) => r.url)).not.toContain('/core/v1/auth/change-password');
  });

  it('shows the server error', async () => {
    await renderView({
      [ME]: me(false),
      [CHANGE]: { status: 400, data: envelope(null, 'Current password is incorrect') },
    });

    await fill('wrong-secret', 'new-secret-1', 'new-secret-1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect');
  });
});
