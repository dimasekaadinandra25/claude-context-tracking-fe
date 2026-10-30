import { Navigate } from 'react-router';

import { paths } from 'src/routes/paths';

import { useAuthContext } from '../hooks';

type Props = {
  children: React.ReactNode;
};

export function AdminGuard({ children }: Props) {
  const { user } = useAuthContext();

  if (!user?.is_super_admin) {
    return <Navigate to={paths.dashboard.person()} replace />;
  }

  return <>{children}</>;
}
