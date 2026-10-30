import { varAlpha } from 'minimal-shared/utils';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

const TINT = { border: 0.32, fill: 0.08 };

type Props = {
  title: string;
  value: string;
};

export function KpiTile({ title, value }: Props) {
  return (
    <Card
      sx={(theme) => ({
        p: 3,
        height: '100%',
        boxShadow: 'none',
        border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, TINT.border)}`,
        bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, TINT.fill),
      })}
    >
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ mt: 1, color: 'text.primary' }}>
        {value}
      </Typography>
    </Card>
  );
}
