import type { TFunction } from 'i18next';

import { it, expect, describe } from 'vitest';

import { sessionColumns, defaultSessionColumns } from './session-columns';

const SESSIONS_GRID_WIDTH_AT_1440 = 1024;
const DEFAULT_COLUMN_WIDTH = 100;

const t = ((key: string) => key) as unknown as TFunction;

function visibleColumns() {
  return sessionColumns(t).filter((c) => defaultSessionColumns[c.field] !== false);
}

describe('sessionColumns', () => {
  it('defaultSessionColumnsFitAt1440', () => {
    const width = visibleColumns().reduce(
      (sum, c) => sum + (c.width ?? c.minWidth ?? DEFAULT_COLUMN_WIDTH),
      0
    );

    expect(width).toBeLessThanOrEqual(SESSIONS_GRID_WIDTH_AT_1440);
  });

  it('shows the key columns by default and hides the low-value ones', () => {
    expect(visibleColumns().map((c) => c.field)).toEqual([
      'title',
      'user_name',
      'models',
      'new_context',
      'output_tokens',
      'latest_peak',
      'last_request_at',
    ]);
  });

  it('leaves room for a full latest / peak value', () => {
    const latestPeak = sessionColumns(t).find((c) => c.field === 'latest_peak');

    expect(latestPeak?.width).toBeGreaterThanOrEqual(140);
  });
});
