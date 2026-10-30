import type { Theme, Components } from '@mui/material/styles';

import { chartColors } from '../palette';

const MuiChartsDataProvider: Components<Theme>['MuiChartsDataProvider'] = {
  defaultProps: {
    colors: (mode) => chartColors[mode],
  },
};

export const charts: Components<Theme> = {
  MuiChartsDataProvider,
};
