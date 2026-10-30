import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

type Props = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function ChartCard({ title, action, children }: Props) {
  return (
    <Card>
      <CardHeader title={title} action={action} />
      <Box sx={{ p: 2 }}>{children}</Box>
    </Card>
  );
}
