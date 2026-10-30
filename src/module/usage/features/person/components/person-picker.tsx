import { useCallback } from 'react';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useTranslate } from 'src/locales';

import { getPeople } from '../../../api/usage';
import { useFetch } from '../../../hooks/use-fetch';

const PICKER_WIDTH = 240;

export function PersonPicker({ userId }: { userId: string }) {
  const { t } = useTranslate('usage');
  const router = useRouter();
  const load = useCallback(() => getPeople(), []);
  const { data } = useFetch(load);
  const people = data ?? [];

  return (
    <TextField
      select
      size="small"
      label={t('person.picker')}
      value={people.some((p) => p.id === userId) ? userId : ''}
      onChange={(event) => router.push(paths.dashboard.person(event.target.value))}
      sx={{ minWidth: PICKER_WIDTH }}
    >
      {people.map((p) => (
        <MenuItem key={p.id} value={p.id}>
          {p.full_name || p.email}
        </MenuItem>
      ))}
    </TextField>
  );
}
