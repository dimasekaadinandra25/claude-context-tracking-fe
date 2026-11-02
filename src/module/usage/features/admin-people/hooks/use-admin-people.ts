import { useMemo, useState, useCallback } from 'react';

import { toast } from 'src/shared/ui/snackbar';

import { useFetch } from '../../../hooks/use-fetch';
import { useReportRange } from '../../../hooks/use-report-range';
import { getBudgets, getOverview, adminListUsers } from '../../../api/usage';

const valueOf = <T>(result: PromiseSettledResult<T> | undefined) =>
  result?.status === 'fulfilled' ? result.value : null;

export function useAdminPeople() {
  const { range } = useReportRange();
  const loadStats = useCallback(
    () => Promise.allSettled([getOverview(range), getBudgets(range.tz)]),
    [range]
  );
  const list = useFetch(adminListUsers, false);
  const stats = useFetch(loadStats);
  const reloadList = list.reload;
  const reloadStats = stats.reload;

  const users = useMemo(() => {
    const [overview, budgetList] = stats.data ?? [];
    const synced = new Map(valueOf(overview)?.people.map((p) => [p.user_id, p.last_synced_at]));
    const budgets = new Map(valueOf(budgetList)?.map((b) => [b.user_id, b.monthly_new_context]));
    return (list.data ?? []).map((u) => ({
      ...u,
      last_synced_at: synced.get(u.id) ?? null,
      monthly_new_context: budgets.get(u.id) ?? null,
    }));
  }, [list.data, stats.data]);

  const reload = useCallback(() => {
    reloadList();
    reloadStats();
  }, [reloadList, reloadStats]);

  return { users, error: list.error, loading: list.loading, reload };
}

export function useAdminAction() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { run, busy, error, clearError };
}
