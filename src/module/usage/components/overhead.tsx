import type { Theme } from '@mui/material/styles';
import type { Overhead } from '../types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { chartColors } from 'src/theme/core/palette';

import { ChartCard } from './chart-card';
import { formatTokens } from '../utils/format';

const PARTS: [keyof Overhead, string][] = [
  ['system_tokens', 'system'],
  ['memory_tokens', 'memory'],
  ['agents_tokens', 'agents'],
  ['skills_tokens', 'skills'],
];

const PERCENT = 100;
const BAR_HEIGHT = 8;
const BAR_WIDTH = 64;
const SWATCH = 10;

export const overheadTotal = (overhead: Overhead) =>
  PARTS.reduce((sum, [field]) => sum + overhead[field], 0);

const partColor = (index: number) => (theme: Theme) => ({
  bgcolor: chartColors.light[index],
  ...theme.applyStyles('dark', { bgcolor: chartColors.dark[index] }),
});

function OverheadRows({ overhead }: { overhead: Overhead }) {
  const { t } = useTranslate('usage');
  return (
    <Stack spacing={0.5}>
      {PARTS.map(([field, key], index) => (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={[{ width: SWATCH, height: SWATCH, borderRadius: '50%' }, partColor(index)]} />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {t(`overhead.${key}`)}
          </Typography>
          <Typography variant="body2">{formatTokens(overhead[field])}</Typography>
        </Box>
      ))}
    </Stack>
  );
}

export function OverheadBar({ overhead }: { overhead: Overhead }) {
  const total = overheadTotal(overhead);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 1 }}>
      {formatTokens(total)}
      <Tooltip title={<OverheadRows overhead={overhead} />}>
        <Box
          role="img"
          aria-label={formatTokens(total)}
          sx={{ display: 'flex', width: BAR_WIDTH, height: BAR_HEIGHT, overflow: 'hidden' }}
        >
          {PARTS.map(([field], index) => (
            <Box
              key={field}
              sx={[
                { width: `${total > 0 ? (overhead[field] / total) * PERCENT : 0}%` },
                partColor(index),
              ]}
            />
          ))}
        </Box>
      </Tooltip>
    </Box>
  );
}

export function OverheadCard({ overhead }: { overhead: Overhead }) {
  const { t } = useTranslate('usage');
  return (
    <ChartCard title={t('overhead.title')}>
      <OverheadRows overhead={overhead} />
      <Box sx={{ display: 'flex', mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {t('overhead.total')}
        </Typography>
        <Typography variant="subtitle2">{formatTokens(overheadTotal(overhead))}</Typography>
      </Box>
    </ChartCard>
  );
}
