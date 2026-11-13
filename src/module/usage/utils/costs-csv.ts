import type { TFunction } from 'i18next';
import type { CostUsage } from '../types';

import { planLabel } from './plan';

const COST_DECIMALS = 2;

const HEADERS = [
  'person',
  'account',
  'plan',
  'project',
  'input',
  'cacheWrite',
  'cacheRead',
  'output',
  'requests',
  'weighted',
  'cost',
];

const quote = (value: string | number) => {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const toLine = (values: (string | number)[]) => values.map(quote).join(',');

export function costsCsv(rows: CostUsage[], t: TFunction): string {
  const lines = rows.map((row) =>
    toLine([
      row.full_name,
      row.claude_email ?? '',
      planLabel({ claude_plan: row.claude_tier, claude_tier: row.claude_tier }) ?? '',
      row.project || t('projects.private'),
      row.input_tokens,
      row.cache_write_tokens,
      row.cache_read_tokens,
      row.output_tokens,
      row.requests,
      row.weight,
      row.cost.toFixed(COST_DECIMALS),
    ])
  );
  return [toLine(HEADERS.map((key) => t(`costs.col.${key}`))), ...lines].join('\r\n');
}
