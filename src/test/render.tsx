import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { render } from '@testing-library/react';

import { ThemeProvider } from 'src/theme';
import { I18nProvider } from 'src/locales';
import { useAuthContext } from 'src/module/core/features/auth/hooks';
import { AuthProvider } from 'src/module/core/features/auth/context/jwt';
import { defaultSettings, SettingsProvider } from 'src/module/core/features/settings';

// ----------------------------------------------------------------------

/**
 * Renders `ui` inside the same providers as src/app.tsx that a page needs
 * (i18n, auth, settings, theme) plus a MemoryRouter at `route`.
 */
export function renderWithAppProviders(ui: React.ReactNode, route = '/') {
  return render(
    <I18nProvider>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider>
            <MemoryRouter initialEntries={[route]}>
              <Suspense fallback={null}>{ui}</Suspense>
            </MemoryRouter>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

/** Shows the auth state the way the app header would, for assertions. */
export function AuthStatusProbe() {
  const { loading, user } = useAuthContext();

  if (loading) return <p>session: loading</p>;
  if (!user) return <p>session: signed out</p>;
  return <p>{`session: ${user.full_name}${user.is_super_admin ? ' (admin)' : ''}`}</p>;
}
