import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  value: string;
  change?: { label: string; color: string };
};

export function KpiTile({ title, value, change }: Props) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
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
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: change.color }}>
          {change.label}
        </Typography>
      )}
    </Card>
  );
}
