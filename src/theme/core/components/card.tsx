import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiCard: Components<Theme>['MuiCard'] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      position: 'relative',
      boxShadow: `var(--card-shadow, ${theme.vars.customShadows.card})`,
      borderRadius: `var(--card-radius, ${Number(theme.shape.borderRadius) * 2}px)`,
      zIndex: 0, // Fix Safari overflow: hidden with border radius
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
