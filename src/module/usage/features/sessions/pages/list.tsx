import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { SessionsListView } from '../views/sessions-list-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('sessions.title')} - ${CONFIG.appName}`}</title>
      <SessionsListView />
    </>
  );
}
