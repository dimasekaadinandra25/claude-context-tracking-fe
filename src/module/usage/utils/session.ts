import type { TFunction } from 'i18next';

export const sessionTitle = (session: { title: string }, t: TFunction) =>
  session.title || t('session.private');
