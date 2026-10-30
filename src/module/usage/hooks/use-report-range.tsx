import type { ReportRange } from '../utils/range';

import { use, useMemo, useState, createContext } from 'react';

import { defaultRange } from '../utils/range';

type ReportRangeValue = {
  range: ReportRange;
  setRange: (range: ReportRange) => void;
};

const ReportRangeContext = createContext<ReportRangeValue | undefined>(undefined);

export function ReportRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<ReportRange>(() => defaultRange());
  const value = useMemo(() => ({ range, setRange }), [range]);
  return <ReportRangeContext value={value}>{children}</ReportRangeContext>;
}

export function useReportRange(): ReportRangeValue {
  const context = use(ReportRangeContext);
  if (!context) {
    throw new Error('useReportRange must be used inside ReportRangeProvider');
  }
  return context;
}
