import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { WeeksView } from '../views/weeks-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('weeks.title')} - ${CONFIG.appName}`}</title>
      <WeeksView />
    </>
  );
}
