import Link from '@mui/material/Link';

import { RouterLink } from 'src/routes/components';

type Props = {
  href: string;
  tabIndex?: number;
  children: React.ReactNode;
};

export function RowLink({ href, tabIndex, children }: Props) {
  return (
    <Link
      component={RouterLink}
      href={href}
      tabIndex={tabIndex}
      color="inherit"
      underline="hover"
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </Link>
  );
}
