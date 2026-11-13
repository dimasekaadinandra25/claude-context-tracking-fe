import type { IconButtonProps } from '@mui/material/IconButton';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { allLangs, useTranslate } from 'src/locales';

export function LanguageButton({ sx, ...other }: IconButtonProps) {
  const { t, currentLang, onChangeLang } = useTranslate('navigation');
  const next = allLangs.find((lang) => lang.value !== currentLang.value) ?? currentLang;
  const label = t('account.language', { language: next.label });

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={() => onChangeLang(next.value)}
        sx={[
          { width: 40, height: 40, typography: 'subtitle2' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        {currentLang.value.toUpperCase()}
      </IconButton>
    </Tooltip>
  );
}
