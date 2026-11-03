import type { OverviewPerson } from 'src/module/usage/types';
import type { Column } from 'src/module/usage/components/data-table';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { DataTable } from 'src/module/usage/components/data-table';
import { ChartCard } from 'src/module/usage/components/chart-card';

const count = (value: number) => value.toLocaleString();

const NAME_SX = {
  width: { xs: '100%', sm: 'auto' },
  maxWidth: { xs: 0, sm: 'none' },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const COUNT_SX = { whiteSpace: { xs: 'normal' } };

const underPressure = (people: OverviewPerson[]) =>
  people
    .filter((p) => p.sessions_near_full > 0 || p.compactions > 0)
    .sort((a, b) => b.sessions_near_full - a.sessions_near_full || b.compactions - a.compactions);

export function ContextPressureCard({ people }: { people: OverviewPerson[] }) {
  const { t } = useTranslate('usage');
  const columns: Column<OverviewPerson>[] = [
    { id: 'name', label: t('col.name'), sx: NAME_SX, render: (p) => p.full_name || p.email },
    {
      id: 'nearFull',
      label: t('pressure.nearFull'),
      align: 'right',
      sx: COUNT_SX,
      render: (p) => count(p.sessions_near_full),
    },
    {
      id: 'compactions',
      label: t('pressure.compactions'),
      align: 'right',
      sx: COUNT_SX,
      render: (p) => count(p.compactions),
    },
  ];

  return (
    <ChartCard title={t('pressure.title')}>
      <DataTable
        columns={columns}
        rows={underPressure(people)}
        rowKey={(p) => p.user_id}
        emptyMessage={t('pressure.empty')}
      />
    </ChartCard>
  );
}

export function PersonPressureCard({ person }: { person: OverviewPerson }) {
  const { t } = useTranslate('usage');
  const stats: [string, number][] = [
    ['nearFull', person.sessions_near_full],
    ['compactions', person.compactions],
  ];

  return (
    <ChartCard title={t('pressure.title')}>
      <Box sx={{ display: 'flex', gap: 6 }}>
        {stats.map(([key, value]) => (
          <Box key={key}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t(`pressure.${key}`)}
            </Typography>
            <Typography variant="h4">{count(value)}</Typography>
          </Box>
        ))}
      </Box>
    </ChartCard>
  );
}
