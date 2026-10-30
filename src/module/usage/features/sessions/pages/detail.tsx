import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { SessionDetailView } from '../views/session-detail-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('session.title')} - ${CONFIG.appName}`}</title>
      <SessionDetailView />
    </>
  );
}
