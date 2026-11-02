import type { ReportRange } from '../utils/range';

import { use, useMemo, useState, useEffect, createContext } from 'react';

import { REFRESH_INTERVAL_MS } from './use-fetch';
import { lastDays, isSameRange, DEFAULT_DAYS } from '../utils/range';

type ReportRangeValue = {
  range: ReportRange;
  preset: number | null;
  setRange: (range: ReportRange) => void;
  setPreset: (days: number) => void;
};

type RangeState = { range: ReportRange; preset: number | null };

const ReportRangeContext = createContext<ReportRangeValue | undefined>(undefined);

function rollOver(state: RangeState): RangeState {
  if (!state.preset) return state;
  const range = lastDays(state.preset, new Date(), state.range.tz);
  return isSameRange(range, state.range) ? state : { ...state, range };
}

export function ReportRangeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RangeState>(() => ({
    range: lastDays(DEFAULT_DAYS),
    preset: DEFAULT_DAYS,
  }));

  useEffect(() => {
    if (!state.preset) return undefined;
    const timer = setInterval(() => setState(rollOver), REFRESH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [state.preset]);

  const value = useMemo(
    () => ({
      ...state,
      setRange: (range: ReportRange) => setState({ range, preset: null }),
      setPreset: (days: number) =>
        setState((prev) => ({ range: lastDays(days, new Date(), prev.range.tz), preset: days })),
    }),
    [state]
  );
  return <ReportRangeContext value={value}>{children}</ReportRangeContext>;
}

export function useReportRange(): ReportRangeValue {
  const context = use(ReportRangeContext);
  if (!context) {
    throw new Error('useReportRange must be used inside ReportRangeProvider');
  }
  return context;
}
