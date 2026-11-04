import type { Overview } from 'src/module/usage/types';

import { useCallback } from 'react';

import { getTools } from 'src/module/usage/api/usage';
import { useFetch } from 'src/module/usage/hooks/use-fetch';
import { useReportRange } from 'src/module/usage/hooks/use-report-range';

import { ActivityCard } from './activity-card';

export function RangeActivityCard({ overview, userId }: { overview: Overview; userId?: string }) {
  const { range } = useReportRange();
  const load = useCallback(() => getTools(range, userId), [range, userId]);
  const { data } = useFetch(load);

  return (
    <ActivityCard
      linesAdded={overview.total_lines_added}
      linesRemoved={overview.total_lines_removed}
      commits={overview.total_commits}
      outputTokens={overview.total_output_tokens}
      tools={data ?? []}
    />
  );
}
