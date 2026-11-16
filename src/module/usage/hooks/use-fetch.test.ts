import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { useFetch, REFRESH_INTERVAL_MS } from './use-fetch';

describe('useFetch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('refreshes silently every interval', async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    const { result } = renderHook(() => useFetch(load));
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(result.current.data).toBe(1);

    let sawLoading = false;
    act(() => {
      vi.advanceTimersByTime(REFRESH_INTERVAL_MS);
    });
    sawLoading = result.current.loading;
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.data).toBe(2);
    expect(sawLoading).toBe(false);
  });

  it('keepsDataWhenARefreshFails', async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useFetch(load));
    await act(() => vi.advanceTimersByTimeAsync(0));

    await act(() => vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS));

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.data).toBe(1);
    expect(result.current.error).toBe('offline');
  });

  it('skipsTheIntervalWhenRefreshIsOff', async () => {
    const load = vi.fn().mockResolvedValue(1);
    renderHook(() => useFetch(load, false));
    await act(() => vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 2));

    expect(load).toHaveBeenCalledTimes(1);
  });

  it('clearsDataWhenLoadChanges', async () => {
    const first = vi.fn().mockResolvedValue('mia');
    const next = vi.fn(() => new Promise<string>(() => undefined));
    const { result, rerender } = renderHook(({ load }) => useFetch(load), {
      initialProps: { load: first as () => Promise<string> },
    });
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(result.current.data).toBe('mia');

    rerender({ load: next });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
  });

  it('keepsTheLastSuccessTimeWhenARefreshFails', async () => {
    const load = vi.fn().mockResolvedValueOnce(1).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useFetch(load));
    await act(() => vi.advanceTimersByTimeAsync(0));
    const { updatedAt } = result.current;

    await act(() => vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS));

    expect(updatedAt).toEqual(expect.any(Number));
    expect(result.current.updatedAt).toBe(updatedAt);
  });

  it('pausesWhileHiddenAndRefetchesWhenVisible', async () => {
    let hidden = true;
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
    const load = vi.fn().mockResolvedValue(1);
    renderHook(() => useFetch(load));
    await act(() => vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS * 2));
    expect(load).toHaveBeenCalledTimes(1);

    hidden = false;
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(load).toHaveBeenCalledTimes(2);
  });
});
