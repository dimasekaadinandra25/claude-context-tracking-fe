import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

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
