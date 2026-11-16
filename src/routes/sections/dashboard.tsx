import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/shared/config';
import { DashboardLayout } from 'src/layouts/dashboard';
import { LoadingScreen } from 'src/shared/ui/loading-screen';
import { useAuthContext } from 'src/module/core/features/auth/hooks';
import { ReportRangeProvider } from 'src/module/usage/hooks/use-report-range';
import {
  AuthGuard,
  AdminGuard,
  ViewAllGuard,
  PasswordChangeGuard,
} from 'src/module/core/features/auth/guard';

import { usePathname } from '../hooks';

const OverviewPage = lazy(() => import('src/module/usage/features/overview/pages'));
const PersonPage = lazy(() => import('src/module/usage/features/person/pages'));
const SessionsPage = lazy(() => import('src/module/usage/features/sessions/pages/list'));
const SessionPage = lazy(() => import('src/module/usage/features/sessions/pages/detail'));
const ModelsPage = lazy(() => import('src/module/usage/features/models/pages'));
const WeeksPage = lazy(() => import('src/module/usage/features/weeks/pages'));
const ProjectsPage = lazy(() => import('src/module/usage/features/projects/pages'));
const AdminPeoplePage = lazy(() => import('src/module/usage/features/admin-people/pages'));
const AdminAlertsPage = lazy(() => import('src/module/usage/features/admin-alerts/pages'));
const AdminActivityPage = lazy(() => import('src/module/usage/features/admin-activity/pages'));
const ChangePasswordPage = lazy(
  () => import('src/module/core/features/auth/pages/change-password')
);

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
      to={user?.can_view_all ? paths.dashboard.overview : paths.dashboard.person()}
      replace
    />
  );
}

const dashboardLayout = () => (
  <PasswordChangeGuard>
    <ReportRangeProvider>
      <DashboardLayout>
        <SuspenseOutlet />
      </DashboardLayout>
    </ReportRangeProvider>
  </PasswordChangeGuard>
);

const admin = (element: React.ReactElement) => <AdminGuard>{element}</AdminGuard>;

const viewAll = (element: React.ReactElement) => <ViewAllGuard>{element}</ViewAllGuard>;

export const dashboardRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to={paths.dashboard.root} replace /> },
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: 'overview', element: viewAll(<OverviewPage />) },
      { path: 'person', element: <PersonPage /> },
      { path: 'person/:id', element: <PersonPage /> },
      { path: 'sessions', element: <SessionsPage /> },
      { path: 'sessions/:id', element: <SessionPage /> },
      { path: 'models', element: <ModelsPage /> },
      { path: 'weeks', element: <WeeksPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'admin/people', element: admin(<AdminPeoplePage />) },
      { path: 'admin/alerts', element: admin(<AdminAlertsPage />) },
      { path: 'admin/activity', element: admin(<AdminActivityPage />) },
      { path: 'account/password', element: <ChangePasswordPage /> },
    ],
  },
];
