import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { AlertSettingsView } from '../views/alert-settings-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('alertSettings.title')} - ${CONFIG.appName}`}</title>
      <AlertSettingsView />
    </>
  );
}
