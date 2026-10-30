import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/shared/config';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/shared/ui/loading-screen';
import { useAuthContext } from 'src/module/core/features/auth/hooks';
import { AuthGuard, AdminGuard } from 'src/module/core/features/auth/guard';
import { ReportRangeProvider } from 'src/module/usage/hooks/use-report-range';

import { usePathname } from '../hooks';

const OverviewPage = lazy(() => import('src/module/usage/features/overview/pages'));
const PersonPage = lazy(() => import('src/module/usage/features/person/pages'));
const SessionsPage = lazy(() => import('src/module/usage/features/sessions/pages/list'));
const SessionPage = lazy(() => import('src/module/usage/features/sessions/pages/detail'));
const ModelsPage = lazy(() => import('src/module/usage/features/models/pages'));
const AdminPeoplePage = lazy(() => import('src/module/usage/features/admin-people/pages'));

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

function HomeRedirect() {
  const { user } = useAuthContext();
  return (
    <Navigate
      to={user?.is_super_admin ? paths.dashboard.overview : paths.dashboard.person()}
      replace
    />
  );
}

const dashboardLayout = () => (
  <ReportRangeProvider>
    <DashboardLayout>
      <SuspenseOutlet />
    </DashboardLayout>
  </ReportRangeProvider>
);

const admin = (element: React.ReactElement) => <AdminGuard>{element}</AdminGuard>;

export const dashboardRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to={paths.dashboard.root} replace /> },
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'overview', element: admin(<OverviewPage />) },
      { path: 'person', element: <PersonPage /> },
      { path: 'person/:id', element: <PersonPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'sessions/:id', element: <SessionPage /> },
      { path: 'models', element: <ModelsPage /> },
      { path: 'admin/people', element: admin(<AdminPeoplePage />) },
    ],
  },
];
