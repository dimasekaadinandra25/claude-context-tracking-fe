import dayjs from 'dayjs';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';

type Props = {
  updatedAt?: number;
  error?: string | null;
};

export function FreshnessStamp({ updatedAt, error }: Props) {
  const { t } = useTranslate('usage');

  if (!updatedAt) return null;

  const time = dayjs(updatedAt).format('HH:mm');

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {t('freshness.updated', { time })}
      </Typography>
      {error && <Chip size="small" color="warning" label={t('freshness.stale', { time })} />}
    </Stack>
  );
}
