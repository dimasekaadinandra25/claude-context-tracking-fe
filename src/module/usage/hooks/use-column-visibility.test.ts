import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach } from 'vitest';

import { useColumnVisibility, defaultPeopleColumns } from './use-column-visibility';

const KEY = 'test.columns';

const render = () => renderHook(() => useColumnVisibility(KEY, defaultPeopleColumns, 'name'));

describe('useColumnVisibility', () => {
  it('defaultPeopleColumns shows every column', () => {
    const { result } = render();
    expect(result.current[0]).toEqual({ name: true });
  });

  it('lets a saved choice override the defaults', () => {
    localStorage.setItem(KEY, JSON.stringify({}));
    const { result } = render();
    expect(result.current[0]).toEqual({ name: true });
  });

  it('restores the stored model and keeps the locked column visible', () => {
    localStorage.setItem(KEY, JSON.stringify({ requests: false, name: false }));
    const { result } = render();
    expect(result.current[0]).toEqual({ requests: false, name: true });
  });

  it('falls back to the defaults on unreadable storage', () => {
    localStorage.setItem(KEY, 'not json');
    const { result } = render();
    expect(result.current[0]).toEqual({ ...defaultPeopleColumns, name: true });
  });

  it('persists updates', () => {
    const { result } = render();
    act(() => result.current[1]({ sessions: false }));
    expect(result.current[0]).toEqual({ sessions: false });
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual({ sessions: false });
  });
});

describe('useColumnVisibility on a phone', () => {
  afterEach(() => vi.unstubAllGlobals());

  const renderPhone = () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    return renderHook(() => useColumnVisibility(KEY, { requests: false }, 'name', ['trend']));
  };

  it('also hides the phone-hidden columns by default', () => {
    const { result } = renderPhone();
    expect(result.current[0]).toEqual({ requests: false, trend: false, name: true });
  });

  it('keeps a saved choice over the phone defaults', () => {
    localStorage.setItem(KEY, JSON.stringify({ trend: true }));
    const { result } = renderPhone();
    expect(result.current[0]).toEqual({ trend: true, name: true });
  });
});
