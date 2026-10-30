import type { LinkProps } from '@mui/material/Link';

import { mergeClasses } from 'minimal-shared/utils';

import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/shared/config';

import { LogoMark } from './logo-mark';
import { logoClasses } from './classes';

// ----------------------------------------------------------------------

const MARK_SIZE = { single: 32, full: 36 };

export type BrandLogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function BrandLogo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = false,
  ...other
}: BrandLogoProps) {
  return (
    <BrandLogoRoot
      component={RouterLink}
      href={href}
      aria-label={CONFIG.appName}
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1.25,
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <LogoMark size={isSingle ? MARK_SIZE.single : MARK_SIZE.full} />
      {!isSingle && (
        <Typography
          variant="h6"
          component="span"
          sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}
        >
          {CONFIG.appName}
        </Typography>
      )}
    </BrandLogoRoot>
  );
}

// ----------------------------------------------------------------------

const BrandLogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
