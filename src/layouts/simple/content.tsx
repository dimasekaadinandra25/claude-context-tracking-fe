import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import { mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { layoutClasses } from '../core';

const PADDING_TOP = 3;
const PADDING_BOTTOM = 10;

// ----------------------------------------------------------------------

export type SimpleCompactContentProps = BoxProps & { layoutQuery?: Breakpoint };

export function SimpleCompactContent({
  sx,
  children,
  className,
  layoutQuery = 'md',
  ...other
}: SimpleCompactContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          width: 1,
          mx: 'auto',
          display: 'flex',
          flex: '1 1 auto',
          textAlign: 'center',
          flexDirection: 'column',
          p: theme.spacing(PADDING_TOP, 2, PADDING_BOTTOM, 2),
          maxWidth: 'var(--layout-simple-content-compact-width)',
          [theme.breakpoints.up(layoutQuery)]: {
            justifyContent: 'center',
            p: theme.spacing(PADDING_BOTTOM, 0, PADDING_BOTTOM, 0),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}
