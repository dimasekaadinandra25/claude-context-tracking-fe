import { Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { useAuthContext } from '../hooks';

type Props = {
  children: React.ReactNode;
};

function Allow({ allowed, children }: Props & { allowed: boolean }) {
  if (!allowed) {
    return <Navigate to={paths.dashboard.person()} replace />;
  }

  return <>{children}</>;
}

export function AdminGuard({ children }: Props) {
  const { user } = useAuthContext();
  return <Allow allowed={!!user?.is_super_admin}>{children}</Allow>;
}

export function ViewAllGuard({ children }: Props) {
  const { user } = useAuthContext();
  return <Allow allowed={!!user?.can_view_all}>{children}</Allow>;
}
