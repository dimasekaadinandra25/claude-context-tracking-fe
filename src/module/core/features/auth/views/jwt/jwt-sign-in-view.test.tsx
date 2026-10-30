import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { testUser, meResponse } from 'src/test/auth-fixtures';
import { envelope, installFakeBackend } from 'src/test/fake-backend';
import { AuthStatusProbe, renderWithAppProviders } from 'src/test/render';

import { JwtSignInView } from './jwt-sign-in-view';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../context/jwt';

// ----------------------------------------------------------------------

const SIGN_IN = 'POST /core/v1/auth/signin';
const ME = 'GET /core/v1/auth/me';
const meAdmin = { status: 200, data: envelope(meResponse({ is_super_admin: true })) };

const signInOk = {
  status: 200,
  data: envelope({
    access_token: 'access-1',
    refresh_token: 'refresh-1',
    token_type: 'Bearer',
    expires_in: 900,
    user: testUser,
    roles: ['super_admin'],
    permissions: [],
  }),
};

async function renderSignIn() {
  renderWithAppProviders(
    <>
      <JwtSignInView />
      <AuthStatusProbe />
    </>,
    '/auth/jwt/sign-in'
  );
  await screen.findByText('session: signed out');
}

async function submit(login: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email or username'), login);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('JwtSignInView + AuthProvider', () => {
  it('signs in with the typed credentials and keeps the session', async () => {
    const backend = installFakeBackend({ [SIGN_IN]: signInOk, [ME]: meAdmin });
    await renderSignIn();

    await submit('rina', 'rahasia-123');

    expect(await screen.findByText('session: Rina Kusuma (admin)')).toBeInTheDocument();
    expect(backend.requests).toEqual([
      expect.objectContaining({
        url: '/core/v1/auth/signin',
        body: { email: 'rina', password: 'rahasia-123' },
      }),
      expect.objectContaining({ url: '/core/v1/auth/me', authorization: 'Bearer access-1' }),
    ]);
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-1');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
  });

  it('shows the backend error and stores nothing when the credentials are rejected', async () => {
    installFakeBackend({
      [SIGN_IN]: { status: 401, data: envelope(null, 'Invalid credentials') },
    });
    await renderSignIn();

    await submit('rina', 'salah-sekali');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.getByText('session: signed out')).toBeInTheDocument();
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it('validates the form before calling the backend', async () => {
    const backend = installFakeBackend({ [SIGN_IN]: signInOk });
    await renderSignIn();

    await submit('rina', 'pendek');

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    await waitFor(() => expect(backend.requests).toHaveLength(0));
  });
});
