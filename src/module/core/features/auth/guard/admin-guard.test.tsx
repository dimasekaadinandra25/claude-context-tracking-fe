import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Route, Routes, MemoryRouter } from 'react-router';

import { testUser, authContextValue } from 'src/test/auth-fixtures';

import { AdminGuard } from './admin-guard';
import { AuthContext } from '../context/auth-context';

function renderAdminRoute(isSuperAdmin: boolean) {
  render(
    <AuthContext value={authContextValue({ user: { ...testUser, is_super_admin: isSuperAdmin } })}>
      <MemoryRouter initialEntries={['/dashboard/admin/people']}>
        <Routes>
          <Route
            path="/dashboard/admin/people"
            element={
              <AdminGuard>
                <p>admin area</p>
              </AdminGuard>
            }
          />
          <Route path="/dashboard/person" element={<p>person page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext>
  );
}

describe('AdminGuard', () => {
  it('adminGuardRedirectsMembers', () => {
    renderAdminRoute(false);

    expect(screen.getByText('person page')).toBeInTheDocument();
    expect(screen.queryByText('admin area')).not.toBeInTheDocument();
  });

  it('renders the children for an admin', () => {
    renderAdminRoute(true);

    expect(screen.getByText('admin area')).toBeInTheDocument();
  });
});
