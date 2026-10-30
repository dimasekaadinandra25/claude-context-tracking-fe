import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { OverviewView } from '../views/overview-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('overview.title')} - ${CONFIG.appName}`}</title>
      <OverviewView />
    </>
  );
}
