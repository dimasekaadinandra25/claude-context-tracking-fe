import type { Budget } from 'src/module/usage/types';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'src/locales';
import { Iconify } from 'src/shared/ui/iconify';
import { getBudgets } from 'src/module/usage/api/usage';
import { useFetch } from 'src/module/usage/hooks/use-fetch';
import { formatTokens } from 'src/module/usage/utils/format';
import { ChartCard } from 'src/module/usage/components/chart-card';
import { EmptyState } from 'src/module/usage/components/empty-state';
import { useReportRange } from 'src/module/usage/hooks/use-report-range';

import { ShareBar } from './share-bar';

const PERCENT = 100;
const WARNING_PERCENT = 80;

type Budgeted = Budget & { monthly_new_context: number };

const hasBudget = (budget: Budget): budget is Budgeted => budget.monthly_new_context !== null;

function budgetColor(percent: number) {
  if (percent >= PERCENT) return 'error';
  if (percent >= WARNING_PERCENT) return 'warning';
  return 'primary';
}

function BudgetRow({ budget }: { budget: Budgeted }) {
  const { t } = useTranslate('usage');
  const percent = Math.round((budget.used_new_context / budget.monthly_new_context) * PERCENT);
  const color = budgetColor(percent);
  const textColor = color === 'primary' ? 'text.secondary' : `${color}.main`;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          {budget.full_name || budget.email}
        </Typography>
        {color !== 'primary' && (
          <Iconify
            icon="solar:danger-triangle-bold"
            width={18}
            aria-label={t(`budget.${color}`)}
            sx={{ color: textColor }}
          />
        )}
        <Typography variant="body2" sx={{ color: textColor }}>
          {t('budget.usage', {
            used: formatTokens(budget.used_new_context),
            budget: formatTokens(budget.monthly_new_context),
            percent,
          })}
        </Typography>
      </Box>
      <ShareBar value={budget.used_new_context} max={budget.monthly_new_context} color={color} />
    </Box>
  );
}

export function BudgetCard({ userId }: { userId?: string }) {
  const { t } = useTranslate('usage');
  const { range } = useReportRange();
  const load = useCallback(() => getBudgets(range.tz), [range.tz]);
  const { data } = useFetch(load);

  if (!data) return null;

  const budgets = data.filter(hasBudget).filter((budget) => !userId || budget.user_id === userId);

  if (userId && budgets.length === 0) return null;

  return (
    <ChartCard title={t('budget.title')}>
      {budgets.length === 0 ? (
        <EmptyState message={t('budget.empty')} />
      ) : (
        <Stack spacing={2.5}>
          {budgets.map((budget) => (
            <BudgetRow key={budget.user_id} budget={budget} />
          ))}
        </Stack>
      )}
    </ChartCard>
  );
}
