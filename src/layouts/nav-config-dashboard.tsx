import type { NavSectionProps } from 'src/shared/ui/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';
import { CONFIG } from 'src/shared/config';
import { SvgColor } from 'src/shared/ui/svg-color';
import { useAuthContext } from 'src/module/core/features/auth/hooks';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  overview: icon('ic-dashboard'),
  person: icon('ic-user'),
  sessions: icon('ic-kanban'),
  models: icon('ic-analytics'),
  people: icon('ic-lock'),
};

export function useNavData(): NavSectionProps['data'] {
  const { t } = useTranslate('navigation');
  const { user } = useAuthContext();
  const isAdmin = !!user?.is_super_admin;

  return useMemo(() => {
    const usage = [
      { title: t('person'), path: paths.dashboard.person(), icon: ICONS.person, deepMatch: true },
      {
        title: t('sessions'),
        path: paths.dashboard.sessions,
        icon: ICONS.sessions,
        deepMatch: true,
      },
      { title: t('models'), path: paths.dashboard.models, icon: ICONS.models },
    ];

    if (!isAdmin) {
      return [{ items: usage }];
    }

    return [
      {
        items: [
          { title: t('overview'), path: paths.dashboard.overview, icon: ICONS.overview },
          ...usage,
        ],
      },
      {
        subheader: t('admin.root'),
        items: [
          { title: t('admin.people'), path: paths.dashboard.adminPeople, icon: ICONS.people },
        ],
      },
    ];
  }, [t, isAdmin]);
}
