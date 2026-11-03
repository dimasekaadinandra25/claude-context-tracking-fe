import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';

import { ProjectsView } from '../views/projects-view';

export default function Page() {
  const { t } = useTranslate('usage');

  return (
    <>
      <title>{`${t('projects.title')} - ${CONFIG.appName}`}</title>
      <ProjectsView />
    </>
  );
}
