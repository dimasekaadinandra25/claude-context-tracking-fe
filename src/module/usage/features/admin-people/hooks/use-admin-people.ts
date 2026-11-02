import { useMemo, useState, useCallback } from 'react';

import { toast } from 'src/shared/ui/snackbar';

import { useFetch } from '../../../hooks/use-fetch';
import { useReportRange } from '../../../hooks/use-report-range';
import { getBudgets, getOverview, adminListUsers } from '../../../api/usage';

export function useAdminPeople() {
  const { range } = useReportRange();
  const load = useCallback(
    () => Promise.all([adminListUsers(), getOverview(range), getBudgets(range.tz)]),
    [range]
  );
  const { data, error, loading, reload } = useFetch(load);

  const users = useMemo(() => {
    const synced = new Map(data?.[1].people.map((p) => [p.user_id, p.last_synced_at]));
    const budgets = new Map(data?.[2].map((b) => [b.user_id, b.monthly_new_context]));
    return (data?.[0] ?? []).map((u) => ({
      ...u,
      last_synced_at: synced.get(u.id) ?? null,
      monthly_new_context: budgets.get(u.id) ?? null,
    }));
  }, [data]);

  return { users, error, loading, reload };
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
