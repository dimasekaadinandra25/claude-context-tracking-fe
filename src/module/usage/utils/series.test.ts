import { it, expect, describe } from 'vitest';

import {
  cellBuckets,
  toDailyByKey,
  toWeekHourGrid,
  toStackedSeries,
  toDailyStackedSeries,
  toHourlyStackedSeries,
} from './series';

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

describe('toDailyStackedSeries', () => {
  it('keeps every day of the range and fills empty days with zero', () => {
    const result = toDailyStackedSeries(
      [
        { bucket: '2026-10-29T00:00:00+07:00', key: 'u1', new_context: 8, requests: 1 },
        { bucket: '2026-11-01T00:00:00+07:00', key: 'u1', new_context: 2, requests: 1 },
      ],
      ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']
    );

    expect(result.buckets).toEqual(['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01']);
    expect(result.series).toEqual([{ id: 'u1', label: 'u1', data: [8, 0, 0, 2] }]);
  });
});

describe('toHourlyStackedSeries', () => {
  it('lists every hour between the first and last bucket', () => {
    const result = toHourlyStackedSeries([
      { bucket: '2026-11-02T12:00:00+07:00', key: 'opus', new_context: 5, requests: 1 },
      { bucket: '2026-11-02T09:00:00+07:00', key: 'opus', new_context: 4, requests: 1 },
    ]);

    expect(result.buckets).toEqual([
      '2026-11-02T02:00:00.000Z',
      '2026-11-02T03:00:00.000Z',
      '2026-11-02T04:00:00.000Z',
      '2026-11-02T05:00:00.000Z',
    ]);
    expect(result.series).toEqual([{ id: 'opus', label: 'opus', data: [4, 0, 0, 5] }]);
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

describe('cellBuckets', () => {
  it('sums each matching bucket and lists the newest first', () => {
    const points = [
      { bucket: '2026-10-26T09:00:00+07:00', key: 'u1', new_context: 4, requests: 1 },
      { bucket: '2026-11-02T09:00:00+07:00', key: 'u1', new_context: 10, requests: 1 },
      { bucket: '2026-11-02T09:00:00+07:00', key: 'u2', new_context: 5, requests: 1 },
      { bucket: '2026-11-02T10:00:00+07:00', key: 'u1', new_context: 9, requests: 1 },
    ];

    expect(cellBuckets(points, 0, 9)).toEqual([
      { bucket: '2026-11-02T09:00:00+07:00', tokens: 15 },
      { bucket: '2026-10-26T09:00:00+07:00', tokens: 4 },
    ]);
  });
});
