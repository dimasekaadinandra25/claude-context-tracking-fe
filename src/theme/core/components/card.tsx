import type { Theme, Components } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

// ----------------------------------------------------------------------

const MuiCard: Components<Theme>['MuiCard'] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      position: 'relative',
      boxShadow: `var(--card-shadow, ${theme.vars.customShadows.card})`,
      borderRadius: `var(--card-radius, ${Number(theme.shape.borderRadius) * 2}px)`,
      zIndex: 0, // Fix Safari overflow: hidden with border radius
      backgroundColor: 'transparent',
      border: `1px solid ${varAlpha(theme.vars.palette.common.whiteChannel, 0.7)}`,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        borderRadius: 'inherit',
        pointerEvents: 'none',
        backgroundColor: varAlpha(theme.vars.palette.background.paperChannel, 0.72),
        backdropFilter: 'blur(16px) saturate(140%)',
      },
      ...theme.applyStyles('dark', {
        border: `1px solid ${varAlpha(theme.vars.palette.common.whiteChannel, 0.08)}`,
        '&::before': {
          backgroundColor: varAlpha(theme.vars.palette.background.paperChannel, 0.55),
        },
      }),
    }),
  },
};

const MuiCardHeader: Components<Theme>['MuiCardHeader'] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    titleTypographyProps: { variant: 'h6' },
    subheaderTypographyProps: { variant: 'body2', marginTop: '4px' },
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3, 3, 0),
    }),
    title: ({ theme }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.25),
      '&::before': {
        content: '""',
        width: 4,
        height: 18,
        flexShrink: 0,
        borderRadius: 2,
        backgroundColor: theme.vars.palette.primary.main,
      },
    }),
  },
};

const MuiCardContent: Components<Theme>['MuiCardContent'] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3),
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const card: Components<Theme> = {
  MuiCard,
  MuiCardHeader,
  MuiCardContent,
};
