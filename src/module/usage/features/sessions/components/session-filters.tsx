import type { SessionFilters as Filters } from '../utils/query';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useTranslate } from 'src/locales';

import { getPeople } from '../../../api/usage';
import { useFetch } from '../../../hooks/use-fetch';

type Props = {
  filters: Filters;
  models: string[];
  isAdmin: boolean;
  onChange: (patch: Filters) => void;
};

const FIELD_WIDTH = 200;

function PersonFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useTranslate('usage');
  const load = useCallback(() => getPeople(), []);
  const people = useFetch(load).data ?? [];

  return (
    <TextField
      select
      size="small"
      label={t('filter.person')}
      value={people.some((p) => p.id === value) ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      sx={{ minWidth: FIELD_WIDTH }}
    >
      <MenuItem value="">{t('filter.all')}</MenuItem>
      {people.map((p) => (
        <MenuItem key={p.id} value={p.id}>
          {p.full_name || p.email}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function SessionFilters({ filters, models, isAdmin, onChange }: Props) {
  const { t } = useTranslate('usage');

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
      {isAdmin && (
        <PersonFilter value={filters.userId ?? ''} onChange={(userId) => onChange({ userId })} />
      )}
      <TextField
        size="small"
        label={t('filter.project')}
        value={filters.project ?? ''}
        onChange={(event) => onChange({ project: event.target.value })}
        sx={{ minWidth: FIELD_WIDTH }}
      />
      <TextField
        select
        size="small"
        label={t('filter.model')}
        value={models.includes(filters.model ?? '') ? filters.model : ''}
        onChange={(event) => onChange({ model: event.target.value })}
        sx={{ minWidth: FIELD_WIDTH }}
      >
        <MenuItem value="">{t('filter.all')}</MenuItem>
        {models.map((model) => (
          <MenuItem key={model} value={model}>
            {model}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        label={t('filter.search')}
        value={filters.q ?? ''}
        onChange={(event) => onChange({ q: event.target.value })}
        sx={{ minWidth: FIELD_WIDTH }}
      />
    </Box>
  );
}
