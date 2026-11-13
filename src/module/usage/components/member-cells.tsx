import type { MemberUsage } from 'src/module/usage/utils/member-rows';

import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { useTranslate } from 'src/locales';
import { Label } from 'src/shared/ui/label';
import { oneDecimal } from 'src/module/usage/utils/plan';
import { PlanBadge } from 'src/module/usage/components/plan-limits';

const BLOCK = 'block';
const TEXT_SECONDARY = 'text.secondary';
const SMALLEST_SHARE = 0.1;

const formatShare = (rounded: number, exact: number) =>
  exact > 0 && rounded < SMALLEST_SHARE
    ? `<${oneDecimal(SMALLEST_SHARE)}%`
    : `${oneDecimal(rounded)}%`;

export function NameCell({ row }: { row: MemberUsage }) {
  const { t } = useTranslate('usage');
  const { person } = row;
  return (
    <TableCell sx={{ minWidth: 160, maxWidth: 220 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
        <Typography variant="subtitle2">{person.full_name || person.email}</Typography>
        <PlanBadge person={person} />
        {person.is_active === false && <Label color="default">{t('status.inactive')}</Label>}
      </Box>
      <Typography variant="caption" sx={{ display: BLOCK, color: TEXT_SECONDARY }}>
        {t('planUsage.requests', { count: row.requests.toLocaleString() })}
      </Typography>
    </TableCell>
  );
}

export function ShareCell({ share, shown }: { share: number; shown: number }) {
  const { t } = useTranslate('usage');
  return (
    <TableCell align="right" sx={{ minWidth: 90 }}>
      <Typography variant="subtitle2">{formatShare(shown, share)}</Typography>
      <LinearProgress
        variant="determinate"
        value={share}
        aria-label={t('planUsage.share')}
        sx={{ height: 4, mt: 0.5 }}
      />
    </TableCell>
  );
}
