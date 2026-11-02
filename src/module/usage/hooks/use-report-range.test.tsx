import { act, renderHook } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { REFRESH_INTERVAL_MS } from './use-fetch';
import { lastDays, daysToRange } from '../utils/range';
import { useReportRange, ReportRangeProvider } from './use-report-range';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ReportRangeProvider>{children}</ReportRangeProvider>
);

describe('ReportRangeProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 10, 2, 23, 59, 30) });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rollsAPresetOverAtMidnight', () => {
    const { result } = renderHook(() => useReportRange(), { wrapper });
    act(() => result.current.setPreset(1));
    expect(result.current.range.from).toEqual(new Date(2026, 10, 2));

    act(() => {
      vi.advanceTimersByTime(REFRESH_INTERVAL_MS);
    });

    expect(result.current.preset).toBe(1);
    expect(result.current.range).toEqual(lastDays(1, new Date(2026, 10, 3, 0, 0, 30)));
  });

  it('keepsACustomRangeFixed', () => {
    const { result } = renderHook(() => useReportRange(), { wrapper });
    const custom = daysToRange('2026-10-01', '2026-10-05', result.current.range.tz);
    act(() => result.current.setRange(custom));

    act(() => {
      vi.advanceTimersByTime(REFRESH_INTERVAL_MS);
    });

    expect(result.current.preset).toBeNull();
    expect(result.current.range).toBe(custom);
  });
});
