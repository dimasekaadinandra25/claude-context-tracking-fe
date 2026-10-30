import type {
  TypeAction,
  PaletteColor,
  ColorSystemOptions,
  PaletteColorChannel,
} from '@mui/material/styles';
import type { SchemesRecord } from '../types';

import { varAlpha, createPaletteChannel } from 'minimal-shared/utils';

import { opacity } from './opacity';
import { themeConfig } from '../theme-config';

// ----------------------------------------------------------------------

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../extend-theme-types.d.ts}
 */

// Keys for core palette colors
export type PaletteColorKey = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
export type CommonColorsKeys = 'black' | 'white';

// Palette color without channels
export type PaletteColorNoChannels = Omit<PaletteColor, 'lighterChannel' | 'darkerChannel'>;

// Palette color with channels
export type PaletteColorWithChannels = PaletteColor & PaletteColorChannel;

// Extended palette color shades
export type PaletteColorExtend = {
  lighter: string;
  darker: string;
  lighterChannel: string;
  darkerChannel: string;
};

// Extended common colors
export type CommonColorsExtend = {
  whiteChannel: string;
  blackChannel: string;
};

// Extended text colors
export type TypeTextExtend = {
  disabledChannel: string;
};

// Extended background colors
export type TypeBackgroundExtend = {
  neutral: string;
  neutralChannel: string;
};

// Extended grey colors
export type GreyExtend = {
  '50Channel': string;
  '100Channel': string;
  '200Channel': string;
  '300Channel': string;
  '400Channel': string;
  '500Channel': string;
  '600Channel': string;
  '700Channel': string;
  '800Channel': string;
  '900Channel': string;
};

// Extended palette
export type PaletteExtend = {
  shared: {
    inputOutlined: string;
    inputUnderline: string;
    paperOutlined: string;
    buttonOutlined: string;
  };
};

/**
 * ➤
 * ➤ ➤ Core palette (primary, secondary, info, success, warning, error, common, grey)
 * ➤
 */
export const primary = createPaletteChannel(themeConfig.palette.primary);
export const secondary = createPaletteChannel(themeConfig.palette.secondary);
export const info = createPaletteChannel(themeConfig.palette.info);
export const success = createPaletteChannel(themeConfig.palette.success);
export const warning = createPaletteChannel(themeConfig.palette.warning);
export const error = createPaletteChannel(themeConfig.palette.error);
export const common = createPaletteChannel(themeConfig.palette.common);
export const grey = createPaletteChannel(themeConfig.palette.grey);

/**
 * ➤
 * ➤ ➤ Text, background, action
 * ➤
 */
export const text = {
  light: createPaletteChannel({ primary: '#141413', secondary: '#3D3D3A', disabled: grey[500] }),
  dark: createPaletteChannel({ primary: grey[50], secondary: grey[400], disabled: grey[600] }),
};

export const background = {
  light: createPaletteChannel({ paper: '#FFFFFF', default: grey[50], neutral: grey[200] }),
  dark: createPaletteChannel({ paper: grey[800], default: '#262624', neutral: grey[900] }),
};

export const border = { light: grey[300], dark: grey[700] };

export const chartColors = {
  light: ['#D97757', '#5C8DC2', '#5F8A7D', '#8582B5', '#9A7D50', '#8F7A6A'],
  dark: ['#D97757', '#6A9BCC', '#BCD1CA', '#CBCADB', '#E3DACC', '#8F7A6A'],
};

export const action = (mode: 'light' | 'dark'): Partial<TypeAction> => ({
  active: mode === 'light' ? grey[600] : grey[500],
  hover: varAlpha(grey['500Channel'], 0.08),
  selected: varAlpha(grey['500Channel'], 0.16),
  focus: varAlpha(grey['500Channel'], 0.24),
  disabled: varAlpha(grey['500Channel'], 0.8),
  disabledBackground: varAlpha(grey['500Channel'], 0.24),
  hoverOpacity: 0.08,
  selectedOpacity: 0.08,
  focusOpacity: 0.12,
  activatedOpacity: 0.12,
  disabledOpacity: 0.48,
});

/**
 * ➤
 * ➤ ➤ Extended palette
 * ➤
 */
export const extendPalette: PaletteExtend = {
  shared: {
    inputUnderline: varAlpha(grey['500Channel'], opacity.inputUnderline),
    inputOutlined: varAlpha(grey['500Channel'], 0.2),
    paperOutlined: varAlpha(grey['500Channel'], 0.16),
    buttonOutlined: varAlpha(grey['500Channel'], 0.32),
  },
};

/**
 * ➤
 * ➤ ➤ Base configuration
 * ➤
 */
const basePalette: ColorSystemOptions['palette'] = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  common,
  grey,
  ...extendPalette,
};

/* **********************************************************************
 * 📦 Final
 * **********************************************************************/
export const palette: SchemesRecord<ColorSystemOptions['palette']> = {
  light: {
    ...basePalette,
    text: text.light,
    background: background.light,
    divider: border.light,
    TableCell: { border: border.light },
    action: action('light'),
  },
  dark: {
    ...basePalette,
    text: text.dark,
    background: background.dark,
    divider: border.dark,
    TableCell: { border: border.dark },
    action: action('dark'),
  },
};

export const colorKeys: {
  palette: PaletteColorKey[];
  common: CommonColorsKeys[];
} = {
  palette: ['primary', 'secondary', 'info', 'success', 'warning', 'error'],
  common: ['black', 'white'],
};
