import { it, expect, describe } from 'vitest';

import { niceMax, shareOf, percentChange } from './scale';

describe('niceMax', () => {
  it.each([
    [78_000, 80_000],
    [39_000, 40_000],
    [80_000, 100_000],
    [1_200_000, 2_000_000],
    [1_500_000, 2_000_000],
    [1_000_000, 2_000_000],
    [950, 1_000],
    [0, 0],
    [7, 8],
  ])('rounds %d up to %d', (value, expected) => {
    expect(niceMax(value)).toBe(expected);
  });
});

describe('shareOf', () => {
  it.each([
    [78_000, 80_000, 0.975],
    [39_000, 80_000, 0.4875],
    [80_000, 80_000, 1],
    [0, 80_000, 0],
    [0, 0, 0],
    [5, 0, 0],
  ])('shareOf(%d, %d) is %d', (value, max, expected) => {
    expect(shareOf(value, max)).toBe(expected);
  });
});

describe('percentChange', () => {
  it.each([
    [112, 100, 12],
    [97, 100, -3],
    [100, 100, 0],
    [5, 0, null],
    [0, 0, null],
  ])('percentChange(%d, %d) is %s', (current, previous, expected) => {
    expect(percentChange(current, previous)).toBe(expected);
  });
});
