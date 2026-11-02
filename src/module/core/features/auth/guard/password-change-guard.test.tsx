import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route, Routes, MemoryRouter } from 'react-router';

import { testUser, authContextValue } from 'src/test/auth-fixtures';

import { AuthContext } from '../context/auth-context';
import { PasswordChangeGuard } from './password-change-guard';

function renderGuarded(mustChange: boolean, path = '/dashboard/sessions') {
  const user = { ...testUser, is_super_admin: false, must_change_password: mustChange };
  render(
    <AuthContext value={authContextValue({ user })}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/dashboard/*"
            element={
              <PasswordChangeGuard>
                <Routes>
                  <Route path="sessions" element={<p>sessions page</p>} />
                  <Route path="account/password" element={<p>change password page</p>} />
                </Routes>
              </PasswordChangeGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext>
  );
}

describe('PasswordChangeGuard', () => {
  it('mustChangePasswordRedirects', () => {
    renderGuarded(true);

    expect(screen.getByText('change password page')).toBeInTheDocument();
    expect(screen.queryByText('sessions page')).not.toBeInTheDocument();
  });

  it('renders the children when no change is required', () => {
    renderGuarded(false);

    expect(screen.getByText('sessions page')).toBeInTheDocument();
  });

  it('keeps the change password page reachable while the flag is set', () => {
    renderGuarded(true, '/dashboard/account/password');

    expect(screen.getByText('change password page')).toBeInTheDocument();
  });
});
