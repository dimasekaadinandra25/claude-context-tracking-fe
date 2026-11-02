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
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  step?: number;
  initial?: string;
  hint?: (value: string) => string;
};

type Props = {
  open: boolean;
  title: string;
  submitLabel: string;
  fields: FormField[];
  busy?: boolean;
  secondaryAction?: React.ReactNode;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
};

export function FormDialog({
  open,
  title,
  submitLabel,
  fields,
  busy,
  secondaryAction,
  onClose,
  onSubmit,
}: Props) {
  const { t } = useTranslate('common');
  const [values, setValues] = useState<Record<string, string>>({});
  const valueOf = (field: FormField) => values[field.name] ?? field.initial ?? '';

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(Object.fromEntries(fields.map((field) => [field.name, valueOf(field)])));
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
                value={valueOf(field)}
                helperText={field.hint?.(valueOf(field))}
                onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
                slotProps={{
                  htmlInput: {
                    minLength: field.minLength,
                    maxLength: field.maxLength,
                    min: field.min,
                    step: field.step,
                  },
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          {secondaryAction}
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
