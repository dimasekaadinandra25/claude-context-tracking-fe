import { it, expect, describe } from 'vitest';

import { shortModel, formatTokens } from './format';

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
