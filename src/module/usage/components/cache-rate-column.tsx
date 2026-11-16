import type { TFunction } from 'i18next';
import type { GridColDef } from '@mui/x-data-grid';
import type { CacheUsage } from '../types';

import Box from '@mui/material/Box';

import { cacheHitRate, isLowCacheHit, formatPercent } from '../utils/format';

const WIDTH = 130;

export function cacheRateColumn<T extends CacheUsage>(
  t: TFunction,
  headerName = t('col.cacheHitRate')
): GridColDef<T> {
  return {
    field: 'cache_hit_rate',
    headerName,
    description: t('cache.hint'),
    width: WIDTH,
    valueGetter: (_v, row) => cacheHitRate(row),
    valueFormatter: (value: number | null) => formatPercent(value),
    renderCell: ({ row, formattedValue }) =>
      isLowCacheHit(row) ? (
        <Box component="span" sx={{ color: 'warning.main' }}>
          {formattedValue}
        </Box>
      ) : (
        formattedValue
      ),
  };
}
