import { it, expect, describe } from 'vitest';

import { formatTokens } from './format';

describe('formatTokens', () => {
  it.each([
    [0, '0'],
    [950, '950'],
    [48_000, '48.0K'],
    [1_200_000, '1.2M'],
    [1_000_000, '1M'],
  ])('formats %d as %s', (tokens, expected) => {
    expect(formatTokens(tokens)).toBe(expected);
  });
});
