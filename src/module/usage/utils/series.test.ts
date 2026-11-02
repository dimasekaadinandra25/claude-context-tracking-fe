import { it, expect, describe } from 'vitest';

import { toDailyByKey, toWeekHourGrid, toStackedSeries } from './series';

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

describe('toWeekHourGrid', () => {
  it('buckets by weekday and hour of the report timezone, Monday first', () => {
    const grid = toWeekHourGrid([
      { bucket: '2026-11-02T09:00:00+07:00', key: 'u1', new_context: 10, requests: 1 },
      { bucket: '2026-11-02T09:00:00+07:00', key: 'u2', new_context: 5, requests: 1 },
      { bucket: '2026-11-01T23:00:00-05:00', key: 'u1', new_context: 7, requests: 1 },
      { bucket: '2026-11-09T00:00:00+07:00', key: 'u1', new_context: 3, requests: 1 },
    ]);
    expect(grid).toHaveLength(7);
    expect(grid[0]).toHaveLength(24);
    expect(grid[0][9]).toBe(15);
    expect(grid[0][0]).toBe(3);
    expect(grid[6][23]).toBe(7);
    expect(grid.flat().reduce((a, b) => a + b, 0)).toBe(25);
  });
});

describe('toDailyByKey', () => {
  it('fills each day per key and drops buckets outside the days', () => {
    const result = toDailyByKey(
      [
        { bucket: '2026-10-30T00:00:00+07:00', key: 'u1', new_context: 40, requests: 1 },
        { bucket: '2026-11-01T00:00:00+07:00', key: 'u1', new_context: 2, requests: 1 },
        { bucket: '2026-10-31T00:00:00+07:00', key: 'u2', new_context: 8, requests: 1 },
        { bucket: '2026-10-20T00:00:00+07:00', key: 'u2', new_context: 99, requests: 1 },
      ],
      ['2026-10-30', '2026-10-31', '2026-11-01']
    );
    expect(result.get('u1')).toEqual([40, 0, 2]);
    expect(result.get('u2')).toEqual([0, 8, 0]);
  });
});
