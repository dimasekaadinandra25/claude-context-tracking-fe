import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

import { PageHeader } from 'src/shared/ui/page-header';

type Props = {
  title: string;
  action?: React.ReactNode;
  backHref?: string;
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
};

export function PageShell({ title, action, backHref, loading, error, children }: Props) {
  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader title={title} action={action} backHref={backHref} />
      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {children}
    </Stack>
  );
}
