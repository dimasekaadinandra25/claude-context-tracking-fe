import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import axiosInstance from 'src/shared/lib/axios';
import { makeJwt, makeJwtExpiringIn } from 'src/test/jwt';

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './constant';
import { setTokens, jwtDecode, clearTokens, isAccessTokenExpired } from './utils';

// ----------------------------------------------------------------------

describe('jwtDecode', () => {
  it('reads the payload of a base64url-encoded token', () => {
    const token = makeJwt({ sub: 'user-1', name: 'Rina ~~~ ???' });

    expect(jwtDecode(token)).toEqual({ sub: 'user-1', name: 'Rina ~~~ ???' });
  });

  it('returns null for an empty, truncated, or garbled token', () => {
    expect(jwtDecode('')).toBeNull();
    expect(jwtDecode('only-one-part')).toBeNull();
    expect(jwtDecode('header.%%%not-base64%%%.signature')).toBeNull();
  });
});

describe('isAccessTokenExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T03:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is false while exp is in the future', () => {
    expect(isAccessTokenExpired(makeJwtExpiringIn(60))).toBe(false);
  });

  it('is true from the second exp is reached', () => {
    expect(isAccessTokenExpired(makeJwtExpiringIn(0))).toBe(true);
    expect(isAccessTokenExpired(makeJwtExpiringIn(-60))).toBe(true);
  });

  it('treats a missing token, a token without exp, or an unreadable token as expired', () => {
    expect(isAccessTokenExpired(null)).toBe(true);
    expect(isAccessTokenExpired(makeJwt({ sub: 'user-1' }))).toBe(true);
    expect(isAccessTokenExpired('not-a-jwt')).toBe(true);
  });
});

describe('token storage', () => {
  it('keeps the access token per tab, the refresh token across tabs, and sends the access token', () => {
    setTokens('access-1', 'refresh-1');

    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe('access-1');
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe('refresh-1');
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(axiosInstance.defaults.headers.common.Authorization).toBe('Bearer access-1');
  });

  it('clearTokens removes both tokens and the Authorization header', () => {
    setTokens('access-1', 'refresh-1');

    clearTokens();

    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(axiosInstance.defaults.headers.common.Authorization).toBeUndefined();
  });
});
