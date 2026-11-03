import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  value: string;
  change?: string;
  description?: string;
};

export function KpiTile({ title, value, change, description }: Props) {
  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Tooltip title={description}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', width: 'fit-content' }}>
          {title}
        </Typography>
      </Tooltip>
      <Typography
        variant="h3"
        sx={(theme) => ({
          mt: 1,
          width: 'fit-content',
          color: 'transparent',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundImage: `linear-gradient(90deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.secondary.dark})`,
          ...theme.applyStyles('dark', {
            backgroundImage: `linear-gradient(90deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.secondary.light})`,
          }),
        })}
      >
        {value}
      </Typography>
      {change && (
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
          {change}
        </Typography>
      )}
    </Card>
  );
}
