import type { Theme, CSSObject } from '@mui/material/styles';
import type { SettingsState } from 'src/module/core/features/settings';

import { varAlpha } from 'minimal-shared/utils';

import { bulletColor } from 'src/shared/ui/nav-section';

const CONTENT_PT = 2.5;
const CONTENT_PB = 8;
const CONTENT_PX = 5;
const ALPHA_NAV_BG = 0.4;
const ALPHA_HORIZONTAL_BG = 0.8;
const ALPHA_HORIZONTAL_BG_DARK = 0.96;
const ALPHA_BORDER = 0.12;
const ALPHA_BORDER_DARK = 0.08;

// ----------------------------------------------------------------------

export function dashboardLayoutVars(theme: Theme) {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-mini-width': '88px',
    '--layout-nav-vertical-width': '300px',
    '--layout-nav-horizontal-height': '64px',
    '--layout-dashboard-content-pt': theme.spacing(CONTENT_PT),
    '--layout-dashboard-content-pb': theme.spacing(CONTENT_PB),
    '--layout-dashboard-content-px': theme.spacing(CONTENT_PX),
  };
}

// ----------------------------------------------------------------------

export function dashboardNavColorVars(
  theme: Theme,
  navColor: SettingsState['navColor'] = 'integrate',
  navLayout: SettingsState['navLayout'] = 'vertical'
): Record<'layout' | 'section', CSSObject | undefined> {
  const {
    vars: { palette },
  } = theme;

  switch (navColor) {
    case 'integrate':
      return {
        layout: {
          '--layout-nav-bg': varAlpha(palette.background.defaultChannel, ALPHA_NAV_BG),
          '--layout-nav-horizontal-bg': varAlpha(
            palette.background.defaultChannel,
            ALPHA_HORIZONTAL_BG
          ),
          '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], ALPHA_BORDER),
          '--layout-nav-text-primary-color': palette.text.primary,
          '--layout-nav-text-secondary-color': palette.text.secondary,
          '--layout-nav-text-disabled-color': palette.text.disabled,
          ...theme.applyStyles('dark', {
            '--layout-nav-border-color': varAlpha(palette.grey['500Channel'], ALPHA_BORDER_DARK),
            '--layout-nav-horizontal-bg': varAlpha(
              palette.background.defaultChannel,
              ALPHA_HORIZONTAL_BG_DARK
            ),
          }),
        },
        section: undefined,
      };
    case 'apparent':
      return {
        layout: {
          '--layout-nav-bg': palette.grey[900],
          '--layout-nav-horizontal-bg': varAlpha(
            palette.grey['900Channel'],
            ALPHA_HORIZONTAL_BG_DARK
          ),
          '--layout-nav-border-color': 'transparent',
          '--layout-nav-text-primary-color': palette.common.white,
          '--layout-nav-text-secondary-color': palette.grey[500],
          '--layout-nav-text-disabled-color': palette.grey[600],
          ...theme.applyStyles('dark', {
            '--layout-nav-bg': palette.grey[800],
            '--layout-nav-horizontal-bg': varAlpha(palette.grey['800Channel'], ALPHA_HORIZONTAL_BG),
          }),
        },
        section: {
          // caption
          '--nav-item-caption-color': palette.grey[600],
          // subheader
          '--nav-subheader-color': palette.grey[600],
          '--nav-subheader-hover-color': palette.common.white,
          // item
          '--nav-item-color': palette.grey[500],
          '--nav-item-root-active-color': palette.primary.light,
          '--nav-item-root-open-color': palette.common.white,
          // bullet
          '--nav-bullet-light-color': bulletColor.dark,
          // sub
          ...(navLayout === 'vertical' && {
            '--nav-item-sub-active-color': palette.common.white,
            '--nav-item-sub-open-color': palette.common.white,
          }),
        },
      };
    default:
      throw new Error(`Invalid color: ${navColor}`);
  }
}
