import { Navigate } from 'react-router';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

import { useAuthContext } from '../hooks';

type Props = {
  children: React.ReactNode;
};

export function PasswordChangeGuard({ children }: Props) {
  const { user } = useAuthContext();
  const pathname = usePathname();

  if (user?.must_change_password && pathname !== paths.dashboard.changePassword) {
    return <Navigate to={paths.dashboard.changePassword} replace />;
  }

  return <>{children}</>;
}
