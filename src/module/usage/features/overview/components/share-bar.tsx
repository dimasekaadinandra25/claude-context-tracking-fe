import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';

import { shareOf } from 'src/module/usage/utils/scale';
import { formatTokens } from 'src/module/usage/utils/format';

const PERCENT = 100;

export function ShareBar({ value, max }: { value: number; max: number }) {
  return (
    <Tooltip title={formatTokens(value)}>
      <LinearProgress
        variant="determinate"
        color="primary"
        value={shareOf(value, max) * PERCENT}
        aria-label={formatTokens(value)}
        sx={{ width: 1, height: 8 }}
      />
    </Tooltip>
  );
}
