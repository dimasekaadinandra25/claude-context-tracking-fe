import { it, expect, describe } from 'vitest';

import { defaultRange, buildRangeParams } from './range';

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
