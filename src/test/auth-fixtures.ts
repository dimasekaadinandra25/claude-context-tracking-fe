import type { User, MeResponse, AuthContextValue } from 'src/module/core/features/auth/types';

import { vi } from 'vitest';

export const testUser: User = {
  id: 'user-1',
  email: 'rina@example.test',
  username: 'rina',
  full_name: 'Rina Kusuma',
};

export function meResponse(overrides: Partial<MeResponse> = {}): MeResponse {
  return {
    user: testUser,
    roles: ['member'],
    permissions: ['usage:read'],
    is_super_admin: false,
    ...overrides,
  };
}

export function authContextValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    loading: false,
    user: { ...testUser, is_super_admin: false },
    authenticated: true,
    unauthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    checkUserSession: vi.fn(),
    ...overrides,
  };
}
