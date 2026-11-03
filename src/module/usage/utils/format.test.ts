import { it, expect, describe } from 'vitest';

import { shortModel, cacheHitRate, formatTokens, formatPercent } from './format';

describe('formatTokens', () => {
  it.each([
    [0, '0'],
    [950, '950'],
    [48_000, '48K'],
    [200_000, '200K'],
    [150_500, '150.5K'],
    [1_200_000, '1.2M'],
    [1_000_000, '1M'],
  ])('formats %d as %s', (tokens, expected) => {
    expect(formatTokens(tokens)).toBe(expected);
  });
});

describe('shortModel', () => {
  it.each([
    ['claude-opus-5-5', 'opus-5-5'],
    ['claude-sonnet-5-5', 'sonnet-5-5'],
    ['gpt-x', 'gpt-x'],
    ['my-claude-model', 'my-claude-model'],
  ])('shortens %s to %s', (model, expected) => {
    expect(shortModel(model)).toBe(expected);
  });
});

describe('formatPercent', () => {
  it.each([
    [null, '—'],
    [0, '0%'],
    [0.8, '80%'],
    [0.666, '67%'],
    [1, '100%'],
  ])('formats %s as %s', (ratio, expected) => {
    expect(formatPercent(ratio)).toBe(expected);
  });
});

describe('cacheHitRate', () => {
  it.each([
    [0, 0, 0, null],
    [100, 0, 0, 0],
    [10, 10, 80, 0.8],
    [0, 0, 500, 1],
    [25, 25, 50, 0.5],
  ])('input %d, write %d, read %d gives %s', (input, write, read, expected) => {
    expect(
      cacheHitRate({ input_tokens: input, cache_write_tokens: write, cache_read_tokens: read })
    ).toBe(expected);
  });
});
