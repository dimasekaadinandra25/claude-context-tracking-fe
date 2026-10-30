import 'src/global.css';

import { useEffect } from 'react';

import { usePathname } from 'src/routes/hooks';

import { Snackbar } from 'src/shared/ui/snackbar';
import { themeConfig, ThemeProvider } from 'src/theme';
import { ProgressBar } from 'src/shared/ui/progress-bar';
import { MotionLazy } from 'src/shared/ui/animate/motion-lazy';
import { I18nProvider, LocalizationProvider } from 'src/locales';
import { AuthProvider } from 'src/module/core/features/auth/context/jwt';
import {
  SettingsDrawer,
  defaultSettings,
  SettingsProvider,
} from 'src/module/core/features/settings';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <I18nProvider>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider
            modeStorageKey={themeConfig.modeStorageKey}
            defaultMode={themeConfig.defaultMode}
          >
            <LocalizationProvider>
              <MotionLazy>
                <ProgressBar />
                <Snackbar />
                <SettingsDrawer defaultSettings={defaultSettings} />
                {children}
              </MotionLazy>
            </LocalizationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
