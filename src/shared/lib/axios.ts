import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/shared/config';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

type RetriableConfig = InternalAxiosRequestConfig;

type RefreshHandler = (
  refreshToken: string
) => Promise<{ access_token: string; refresh_token: string }>;
type UnauthorizedHandler = () => void;

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: { 'Content-Type': 'application/json' },
});

let getAccessTokenFn: () => string | null = () => null;
let getRefreshTokenFn: () => string | null = () => null;
let refreshHandler: RefreshHandler | null = null;
let onUnauthorized: UnauthorizedHandler | null = null;

let refreshPromise: Promise<string> | null = null;

export function configureAxiosAuth(opts: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefresh: RefreshHandler;
  onUnauthorized: UnauthorizedHandler;
}) {
  getAccessTokenFn = opts.getAccessToken;
  getRefreshTokenFn = opts.getRefreshToken;
  refreshHandler = opts.onRefresh;
  onUnauthorized = opts.onUnauthorized;
}

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessTokenFn();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !original._skipAuthRefresh) {
      const refreshToken = getRefreshTokenFn();
      if (!refreshToken || !refreshHandler) {
        onUnauthorized?.();
        return Promise.reject(normalizeError(error));
      }

      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshHandler(refreshToken)
            .then((tokens) => tokens.access_token)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newAccessToken = await refreshPromise;
        if (!original.headers) {
          original.headers = {} as InternalAxiosRequestConfig['headers'];
        }
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(original);
      } catch (refreshError) {
        onUnauthorized?.();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function errorDetail(errors: unknown): string | undefined {
  if (typeof errors === 'string') return errors;
  const detail = (errors as { detail?: unknown } | null | undefined)?.detail;
  return Array.isArray(detail) ? detail.join(', ') : undefined;
}

function normalizeError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; errors?: unknown } | undefined;
    const detail =
      errorDetail(payload?.errors) || payload?.message || error.message || 'Something went wrong!';
    const wrapped = new Error(detail);
    (wrapped as Error & { status?: number }).status = error.response?.status;
    return wrapped;
  }
  if (error instanceof Error) return error;
  return new Error('Something went wrong!');
}

export default axiosInstance;

export function withoutAuthRefresh(config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return { ...config, _skipAuthRefresh: true };
}

export const endpoints = {
  auth: {
    signIn: '/core/v1/auth/signin',
    refresh: '/core/v1/auth/refresh',
    logout: '/core/v1/auth/logout',
    me: '/core/v1/auth/me',
  },
  usage: {
    overview: '/usage/v1/overview',
    timeseries: '/usage/v1/timeseries',
    models: '/usage/v1/models',
    sessions: '/usage/v1/sessions',
    session: (id: string) => `/usage/v1/sessions/${id}`,
    people: '/usage/v1/people',
  },
  admin: {
    users: '/core/v1/admin/users',
    deactivate: (id: string) => `/core/v1/admin/users/${id}/deactivate`,
    activate: (id: string) => `/core/v1/admin/users/${id}/activate`,
    resetPassword: (id: string) => `/core/v1/admin/users/${id}/reset-password`,
    apiKeys: (userId: string) => `/core/v1/admin/users/${userId}/api-keys`,
    revokeKey: (keyId: string) => `/core/v1/admin/api-keys/${keyId}/revoke`,
    revealKey: (keyId: string) => `/core/v1/admin/api-keys/${keyId}/reveal`,
  },
} as const;
