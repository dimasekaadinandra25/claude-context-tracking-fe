const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

export const paths = {
  root: '/',
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
    },
  },
  dashboard: {
    root: ROOTS.DASHBOARD,
    overview: `${ROOTS.DASHBOARD}/overview`,
    person: (id?: string) => (id ? `${ROOTS.DASHBOARD}/person/${id}` : `${ROOTS.DASHBOARD}/person`),
    sessions: `${ROOTS.DASHBOARD}/sessions`,
    session: (id: string) => `${ROOTS.DASHBOARD}/sessions/${id}`,
    models: `${ROOTS.DASHBOARD}/models`,
    adminPeople: `${ROOTS.DASHBOARD}/admin/people`,
  },
};
