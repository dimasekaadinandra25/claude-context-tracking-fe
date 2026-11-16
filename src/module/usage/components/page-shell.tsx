import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';

import { PageHeader } from 'src/shared/ui/page-header';

import { FreshnessStamp } from './freshness-stamp';

type Props = {
  title: string;
  action?: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  loading?: boolean;
  error?: string | null;
  updatedAt?: number;
  children?: React.ReactNode;
};

function withStamp(action: React.ReactNode, updatedAt?: number, error?: string | null) {
  if (!action && !updatedAt) return action;
  return (
    <Stack direction="row" spacing={2} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <FreshnessStamp updatedAt={updatedAt} error={error} />
      {action}
    </Stack>
  );
}

export function PageShell({
  title,
  action,
  backHref,
  onBack,
  loading,
  error,
  updatedAt,
  children,
}: Props) {
  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 4 } }}>
      <PageHeader
        title={title}
        action={withStamp(action, updatedAt, error)}
        backHref={backHref}
        onBack={onBack}
      />
      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {children}
    </Stack>
  );
}
