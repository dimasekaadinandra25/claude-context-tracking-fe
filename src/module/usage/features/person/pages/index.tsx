import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { PersonView } from '../views/person-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('person.title')} - ${CONFIG.appName}`}</title>
      <PersonView />
    </>
  );
}
