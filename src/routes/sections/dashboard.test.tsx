import 'src/module/usage/features/overview/pages';

import { Suspense } from 'react';
import { it, expect, describe } from 'vitest';
import { useRoutes, useLocation } from 'react-router';
import { within, screen, waitFor } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { useNavData } from 'src/layouts/nav-config-dashboard';
import { testUser, authContextValue } from 'src/test/auth-fixtures';
import { envelope, installFakeBackend } from 'src/test/fake-backend';
import { ReportRangeProvider } from 'src/module/usage/hooks/use-report-range';
import { AuthContext } from 'src/module/core/features/auth/context/auth-context';

import { dashboardRoutes } from './dashboard';

const pages = dashboardRoutes.find((route) => route.path === 'dashboard')?.children ?? [];

const viewer = { ...testUser, is_super_admin: false, can_view_all: true };

const mia = {
  user_id: 'u-1',
  full_name: 'Mia',
  email: 'mia@example.test',
  current_model: 'claude-opus-4-1',
  new_context: 120000,
  requests: 40,
  sessions: 2,
  last_request_at: '2026-11-01T10:00:00Z',
  last_synced_at: '2026-11-01T10:05:00Z',
};

function Dashboard() {
  const element = useRoutes([{ path: 'dashboard', children: pages }]);
  const { pathname } = useLocation();
  const titles = useNavData().flatMap((section) => section.items.map((item) => item.title));
  return (
    <>
      <Suspense fallback={null}>{element}</Suspense>
      <p>{`at ${pathname}`}</p>
      <ul aria-label="navigation">
        {titles.map((title) => (
          <li key={title}>{title}</li>
        ))}
      </ul>
    </>
  );
}

function renderAsViewer(route: string) {
  installFakeBackend({
    'GET /usage/v1/overview': {
      status: 200,
      data: envelope({
        people: [mia],
        total_new_context: 120000,
        total_requests: 40,
        total_sessions: 2,
        active_people: 1,
      }),
    },
    'GET /usage/v1/timeseries': { status: 200, data: envelope([]) },
  });
  renderWithAppProviders(
    <AuthContext value={authContextValue({ user: viewer })}>
      <ReportRangeProvider>
        <Dashboard />
      </ReportRangeProvider>
    </AuthContext>,
    route
  );
}

const nav = () => within(screen.getByRole('list', { name: 'navigation' }));

describe('read-only viewer', () => {
  it('viewerOpensTheOverviewWithTheMemberTable', async () => {
    renderAsViewer('/dashboard/overview');

    expect(await screen.findByRole('gridcell', { name: 'Mia' })).toBeInTheDocument();
    expect(screen.getByText('at /dashboard/overview')).toBeInTheDocument();
    expect(nav().getByText('Team overview')).toBeInTheDocument();
    expect(nav().queryByText('Members')).not.toBeInTheDocument();
  });

  it('viewerCannotOpenAdminPeople', async () => {
    renderAsViewer('/dashboard/admin/people');

    await waitFor(() => expect(screen.getByText('at /dashboard/person')).toBeInTheDocument());
  });
});
