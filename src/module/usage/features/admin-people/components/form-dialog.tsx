import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useTranslate } from 'src/locales';

export type FormField = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
};

type Props = {
  open: boolean;
  title: string;
  submitLabel: string;
  fields: FormField[];
  busy?: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

export function FormDialog({ open, title, submitLabel, fields, busy, onClose, onSubmit }: Props) {
  const { t } = useTranslate('common');
  const [values, setValues] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ transition: { onExited: () => setValues({}) } }}
    >
      <form onSubmit={submit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                type={field.type ?? 'text'}
                required={field.required}
                value={values[field.name] ?? ''}
                onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                slotProps={{
                  htmlInput: { minLength: field.minLength, maxLength: field.maxLength },
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" loading={busy}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
