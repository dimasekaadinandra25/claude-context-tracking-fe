import { it, expect, describe } from 'vitest';

import { toStackedSeries } from './series';

describe('toStackedSeries', () => {
  it('fills missing buckets with zero and labels each key', () => {
    const result = toStackedSeries(
      [
        { bucket: '2026-10-30T00:00:00+07:00', key: 'u1', new_context: 40, requests: 1 },
        { bucket: '2026-10-29T00:00:00+07:00', key: 'u2', new_context: 8, requests: 1 },
        { bucket: '2026-10-30T00:00:00+07:00', key: 'u2', new_context: 2, requests: 1 },
      ],
      (key) => `name-${key}`
    );

    expect(result.buckets).toEqual(['2026-10-29T00:00:00+07:00', '2026-10-30T00:00:00+07:00']);
    expect(result.series).toEqual([
      { id: 'u1', label: 'name-u1', data: [0, 40] },
      { id: 'u2', label: 'name-u2', data: [8, 2] },
    ]);
  });
});
