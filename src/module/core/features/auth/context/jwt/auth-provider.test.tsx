import type { RecordedRequest } from 'src/test/fake-backend';

import { screen } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';

import { makeJwtExpiringIn } from 'src/test/jwt';
import { meResponse } from 'src/test/auth-fixtures';
import { envelope, installFakeBackend } from 'src/test/fake-backend';
import { AuthStatusProbe, renderWithAppProviders } from 'src/test/render';

import { getMe } from '../../api';
import { setTokens, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '.';

// ----------------------------------------------------------------------

const REFRESH = 'POST /core/v1/auth/refresh';
const ME = 'GET /core/v1/auth/me';

const freshAccess = makeJwtExpiringIn(900);

const refreshOk = {
  status: 200,
  data: envelope({
    access_token: freshAccess,
    refresh_token: 'refresh-2',
    token_type: 'Bearer',
    expires_in: 900,
  }),
};

const meOk = { status: 200, data: envelope(meResponse()) };

const calls = (requests: RecordedRequest[], url: string) => requests.filter((r) => r.url === url);

describe('AuthProvider session', () => {
  it('restores the session after a reload by refreshing an expired access token', async () => {
    setTokens(makeJwtExpiringIn(-60), 'refresh-1');
    const backend = installFakeBackend({ [REFRESH]: refreshOk, [ME]: meOk });

    renderWithAppProviders(<AuthStatusProbe />);

    expect(await screen.findByText('session: Rina Kusuma')).toBeInTheDocument();
    expect(calls(backend.requests, '/core/v1/auth/refresh')[0].body).toEqual({
      refresh_token: 'refresh-1',
    });
    expect(calls(backend.requests, '/core/v1/auth/me')[0].authorization).toBe(
      `Bearer ${freshAccess}`
    );
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe(freshAccess);
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-2');
  });

  it('signs out and clears the tokens when the refresh token is rejected', async () => {
    setTokens(makeJwtExpiringIn(-60), 'refresh-revoked');
    installFakeBackend({
      [REFRESH]: { status: 401, data: envelope(null, 'Refresh token revoked') },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithAppProviders(<AuthStatusProbe />);

    expect(await screen.findByText('session: signed out')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith('[auth] session check failed:', expect.any(Error));
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });
});

describe('AuthProvider + shared axios on 401', () => {
  it('refreshes once for concurrent 401 responses and retries each request with the new token', async () => {
    setTokens(makeJwtExpiringIn(600), 'refresh-1');
    let meCalls = 0;
    const backend = installFakeBackend({
      [REFRESH]: refreshOk,
      [ME]: (request) => {
        meCalls += 1;
        return meCalls === 1 || request.authorization === `Bearer ${freshAccess}`
          ? meOk
          : { status: 401, data: envelope(null, 'Unauthorized') };
      },
    });
    renderWithAppProviders(<AuthStatusProbe />);
    await screen.findByText('session: Rina Kusuma');

    const [first, second] = await Promise.all([getMe(), getMe()]);

    expect(first.user.full_name).toBe('Rina Kusuma');
    expect(second.user.full_name).toBe('Rina Kusuma');
    expect(calls(backend.requests, '/core/v1/auth/refresh')).toHaveLength(1);
    expect(calls(backend.requests, '/core/v1/auth/me')).toHaveLength(5);
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe(freshAccess);
  });
});
