import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { AdminPeopleView } from '../views/admin-people-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('adminPeople.title')} - ${CONFIG.appName}`}</title>
      <AdminPeopleView />
    </>
  );
}
