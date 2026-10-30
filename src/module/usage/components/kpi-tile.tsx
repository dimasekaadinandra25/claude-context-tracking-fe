import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

type Props = {
  title: string;
  value: string;
};

export function KpiTile({ title, value }: Props) {
  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Card>
  );
}
