import type { ApiKey } from '../../../types';

import { useState, useCallback } from 'react';

import { useTranslate } from 'src/locales';

import { useAdminAction } from './use-admin-people';
import { useFetch } from '../../../hooks/use-fetch';
import { adminIssueKey, adminListKeys, adminRevealKey, adminRevokeKey } from '../../../api/usage';

export function useKeys(userId: string) {
  const { t } = useTranslate('usage');
  const load = useCallback(() => (userId ? adminListKeys(userId) : Promise.resolve([])), [userId]);
  const { data, error, reload } = useFetch(load);
  const action = useAdminAction();
  const [issuing, setIssuing] = useState(false);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  const issue = async ({ name }: Record<string, string>) => {
    let key: string | null = null;
    const ok = await action.run(async () => {
      key = (await adminIssueKey(userId, name)).key;
    }, t('keys.issued'));
    if (!ok) return;
    setIssuing(false);
    setIssuedKey(key);
    reload();
  };

  const revoke = async () => {
    if (!revoking) return;
    await action.run(() => adminRevokeKey(revoking.id), t('keys.revoked'));
    setRevoking(null);
    reload();
  };

  const copy = (apiKey: ApiKey) =>
    action.run(
      async () => navigator.clipboard.writeText(await adminRevealKey(apiKey.id)),
      t('keys.keyCopied')
    );

  return {
    keys: data ?? [],
    error,
    action,
    issuing,
    setIssuing,
    issuedKey,
    clearIssuedKey: () => setIssuedKey(null),
    revoking,
    setRevoking,
    issue,
    revoke,
    copy,
  };
}
