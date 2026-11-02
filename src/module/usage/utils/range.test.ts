import { it, expect, describe } from 'vitest';

import {
  lastDays,
  rangeDates,
  isSameRange,
  defaultRange,
  previousRange,
  buildRangeParams,
} from './range';

describe('buildRangeParams', () => {
  it('sends from and to as UTC Z strings and passes tz through', () => {
    const params = buildRangeParams({
      from: new Date('2026-10-24T00:00:00+07:00'),
      to: new Date('2026-10-31T00:00:00+07:00'),
      tz: 'Asia/Jakarta',
    });

    expect(params).toEqual({
      from: '2026-10-23T17:00:00.000Z',
      to: '2026-10-30T17:00:00.000Z',
      tz: 'Asia/Jakarta',
    });
  });
});

describe('defaultRange', () => {
  it('covers the last 7 local days up to the end of today', () => {
    const now = new Date(2026, 9, 30, 15, 30);

    const range = defaultRange(now, 'Asia/Jakarta');

    expect(range.from).toEqual(new Date(2026, 9, 24));
    expect(range.to).toEqual(new Date(2026, 9, 31));
    expect(range.tz).toBe('Asia/Jakarta');
  });
});

describe('lastDays', () => {
  it('covers only today for one day and matches the default range for seven', () => {
    const now = new Date(2026, 9, 30, 15, 30);
    expect(lastDays(1, now, 'UTC')).toEqual({
      from: new Date(2026, 9, 30),
      to: new Date(2026, 9, 31),
      tz: 'UTC',
    });
    expect(isSameRange(lastDays(7, now, 'UTC'), defaultRange(now, 'UTC'))).toBe(true);
    expect(isSameRange(lastDays(30, now, 'UTC'), defaultRange(now, 'UTC'))).toBe(false);
  });
});

describe('previousRange', () => {
  it('ends where the range starts and has the same number of days', () => {
    const range = { from: new Date(2026, 9, 24), to: new Date(2026, 9, 31), tz: 'Asia/Jakarta' };
    expect(previousRange(range)).toEqual({
      from: new Date(2026, 9, 17),
      to: new Date(2026, 9, 24),
      tz: 'Asia/Jakarta',
    });
  });
});

describe('rangeDates', () => {
  it('lists each local day of the range', () => {
    const range = { from: new Date(2026, 9, 30), to: new Date(2026, 10, 2), tz: 'UTC' };
    expect(rangeDates(range)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });
});
