import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { ChangePasswordView } from '../views/change-password-view';

export default function Page() {
  const { t } = useTranslate('auth');

  return (
    <>
      <title>{`${t('changePassword.title')} - ${CONFIG.appName}`}</title>
      <ChangePasswordView />
    </>
  );
}
