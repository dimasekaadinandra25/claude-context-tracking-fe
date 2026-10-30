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
});
