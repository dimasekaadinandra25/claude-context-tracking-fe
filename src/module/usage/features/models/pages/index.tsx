import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { ModelsView } from '../views/models-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('models.title')} - ${CONFIG.appName}`}</title>
      <ModelsView />
    </>
  );
}
