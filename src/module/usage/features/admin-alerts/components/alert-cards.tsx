import type { AlertForm, AlertWord } from '../utils/alerts';

import { useState } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useTranslate } from 'src/locales';

import { isPercent, ALERT_WORDS, MAX_PERCENT, MIN_PERCENT, addThreshold } from '../utils/alerts';

type CardProps = {
  form: AlertForm;
  onChange: (patch: Partial<AlertForm>) => void;
};

const PERCENT_INPUT = { min: MIN_PERCENT, max: MAX_PERCENT, step: 1 };
const FIELD_WIDTH = 140;

function ThresholdChips({ form, onChange }: CardProps) {
  const { t } = useTranslate('usage');

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
      {form.thresholds.map((percent) => (
        <Chip
          key={percent}
          label={`${percent}%`}
          onDelete={() => onChange({ thresholds: form.thresholds.filter((p) => p !== percent) })}
        />
      ))}
      {form.thresholds.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('alertSettings.noThresholds')}
        </Typography>
      )}
    </Stack>
  );
}

export function ThresholdsCard({ form, onChange }: CardProps) {
  const { t } = useTranslate('usage');
  const [draft, setDraft] = useState('');
  const value = Number(draft);
  const canAdd = draft !== '' && isPercent(value) && !form.thresholds.includes(value);

  const add = () => {
    onChange({ thresholds: addThreshold(form.thresholds, value) });
    setDraft('');
  };

  return (
    <Card>
      <CardHeader
        title={t('alertSettings.thresholds')}
        subheader={t('alertSettings.thresholdsHint')}
      />
      <CardContent>
        <ThresholdChips form={form} onChange={onChange} />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            type="number"
            label={t('alertSettings.addPercent')}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            slotProps={{ htmlInput: PERCENT_INPUT }}
            sx={{ width: FIELD_WIDTH }}
          />
          <Button variant="outlined" disabled={!canAdd} onClick={add}>
            {t('alertSettings.add')}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function WordsCard({ form, onChange }: CardProps) {
  const { t } = useTranslate('usage');

  const toggle = (word: AlertWord, checked: boolean) =>
    onChange({ words: checked ? [...form.words, word] : form.words.filter((w) => w !== word) });

  return (
    <Card>
      <CardHeader title={t('alertSettings.alerts')} />
      <CardContent>
        <Stack spacing={1}>
          {ALERT_WORDS.map((word) => (
            <FormControlLabel
              key={word}
              control={
                <Checkbox
                  checked={form.words.includes(word)}
                  onChange={(event) => toggle(word, event.target.checked)}
                />
              }
              label={
                <>
                  <Typography variant="subtitle2">
                    {t(`alertSettings.word.${word}.label`)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {t(`alertSettings.word.${word}.desc`)}
                  </Typography>
                </>
              }
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ShareField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslate('usage');
  const invalid = !isPercent(Number(value)) || value === '';

  return (
    <TextField
      type="number"
      label={label}
      value={value}
      error={invalid}
      helperText={invalid ? t('alertSettings.invalidShare') : hint}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{ htmlInput: PERCENT_INPUT }}
    />
  );
}

export function SharesCard({ form, onChange }: CardProps) {
  const { t } = useTranslate('usage');

  return (
    <Card>
      <CardHeader title={t('alertSettings.shares')} />
      <CardContent>
        <Stack spacing={3}>
          <ShareField
            label={t('alertSettings.runawayShare')}
            hint={t('alertSettings.runawayShareHint')}
            value={form.runawayShare}
            onChange={(runawayShare) => onChange({ runawayShare })}
          />
          <ShareField
            label={t('alertSettings.projectShare')}
            hint={t('alertSettings.projectShareHint')}
            value={form.projectShare}
            onChange={(projectShare) => onChange({ projectShare })}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
