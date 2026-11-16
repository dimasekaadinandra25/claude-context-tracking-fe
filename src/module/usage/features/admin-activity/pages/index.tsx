import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { ActivityLogView } from '../views/activity-log-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('auditLog.title')} - ${CONFIG.appName}`}</title>
      <ActivityLogView />
    </>
  );
}
