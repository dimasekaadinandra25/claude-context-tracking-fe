import type { AuthState, SignInParams, AuthContextValue } from '../../types';

import { useMemo, useState, useEffect, useCallback } from 'react';

import { configureAxiosAuth } from 'src/shared/lib/axios';

import * as authApi from '../../api';
import { AuthContext } from '../auth-context';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
} from './utils';

type Props = {
  children: React.ReactNode;
};

const SIGNED_OUT: AuthState = { loading: false, user: null };

function hasHttpStatus(error: unknown): boolean {
  return typeof (error as { status?: unknown } | null)?.status === 'number';
}

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({ loading: true, user: null });

  const applySignOut = useCallback(() => {
    clearTokens();
    setState(SIGNED_OUT);
  }, []);

  const loadUser = useCallback(async () => {
    const me = await authApi.getMe();
    setState({ loading: false, user: { ...me.user, is_super_admin: me.is_super_admin } });
  }, []);

  const checkUserSession = useCallback(async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!refreshToken && (!accessToken || isAccessTokenExpired(accessToken))) {
      applySignOut();
      return;
    }

    try {
      if (!accessToken || isAccessTokenExpired(accessToken)) {
        const tokens = await authApi.refreshTokens(refreshToken as string);
        setTokens(tokens.access_token, tokens.refresh_token);
      }
      await loadUser();
    } catch (error) {
      console.error('[auth] session check failed:', error);
      if (hasHttpStatus(error)) {
        applySignOut();
      } else {
        setState(SIGNED_OUT);
      }
    }
  }, [applySignOut, loadUser]);

  useEffect(() => {
    configureAxiosAuth({
      getAccessToken,
      getRefreshToken,
      onRefresh: async (refreshToken) => {
        const tokens = await authApi.refreshTokens(refreshToken);
        setTokens(tokens.access_token, tokens.refresh_token);
        return tokens;
      },
      onUnauthorized: applySignOut,
    });

    checkUserSession();
  }, [applySignOut, checkUserSession]);

  const signIn = useCallback(
    async (params: SignInParams) => {
      const res = await authApi.signIn(params);
      setTokens(res.access_token, res.refresh_token);
      await loadUser();
    },
    [loadUser]
  );

  const signOut = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('[auth] sign out api failed:', error);
    } finally {
      applySignOut();
    }
  }, [applySignOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      authenticated: !state.loading && !!state.user,
      unauthenticated: !state.loading && !state.user,
      signIn,
      signOut,
      checkUserSession,
    }),
    [state, signIn, signOut, checkUserSession]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
