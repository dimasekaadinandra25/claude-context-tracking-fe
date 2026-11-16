import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { Snackbar } from 'src/shared/ui/snackbar';
import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { roleOf } from '../components/users-table';
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

describe('AdminPeopleView roles', () => {
  it('roleOfPicksTheStrongestManagedRole', () => {
    expect(roleOf(['member'])).toBe('member');
    expect(roleOf(['member', 'usage_viewer'])).toBe('usage_viewer');
    expect(roleOf(['usage_viewer', 'super_admin'])).toBe('super_admin');
    expect(roleOf([])).toBe('member');
  });

  it('changingTheRoleSavesItAndReloads', async () => {
    const backend = installFakeBackend({
      'GET /core/v1/admin/users': ok([mia]),
      'GET /usage/v1/overview': ok(emptyOverview),
      'GET /usage/v1/budgets': ok([]),
      'PUT /core/v1/admin/users/u-1/role': ok({ role: 'usage_viewer' }),
    });
    const user = userEvent.setup();
    renderWithAppProviders(
      <ReportRangeProvider>
        <AdminPeopleView />
        <Snackbar />
      </ReportRangeProvider>
    );

    await user.click(await screen.findByRole('combobox', { name: 'Role mia@example.test' }));
    await user.click(await screen.findByRole('option', { name: 'Viewer (read-only)' }));

    expect(await screen.findByText(/Mia is now Viewer \(read-only\)/)).toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({ method: 'PUT', url: '/core/v1/admin/users/u-1/role', body: { role: 'usage_viewer' } })
    );
    await waitFor(() =>
      expect(backend.requests.filter((r) => r.url === '/core/v1/admin/users')).toHaveLength(2)
    );
  });
});
