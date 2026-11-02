import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

import { PersonView } from '../views/person-view';

export default function Page() {
  const { t } = useTranslate('usage');
  const { user } = useAuthContext();
  const title = user?.is_super_admin ? t('person.title') : t('person.myTitle');

  return (
    <>
      <title>{`${title} - ${CONFIG.appName}`}</title>
      <PersonView />
    </>
  );
}
