import path from 'path';
import { defineConfig } from 'vitest/config';

// ----------------------------------------------------------------------

// Kept apart from vite.config.ts so the dev-only checker plugin does not start
// inside the test run. The alias mirrors vite.config.ts (imports use `src/...`).
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    // @mui/x-* import their own .css; inlining lets Vite handle those imports.
    server: { deps: { inline: [/@mui\/x-/] } },
    // Node 25+ ships its own (empty) localStorage global, which hides the one
    // from jsdom; turning it off is a no-op on Node 22.
    poolOptions: { forks: { execArgv: ['--no-experimental-webstorage'] } },
  },
});
