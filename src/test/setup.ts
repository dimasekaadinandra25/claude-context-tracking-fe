import '@testing-library/jest-dom/vitest';

import { vi, afterEach } from 'vitest';
import { cleanup, configure } from '@testing-library/react';

configure({ asyncUtilTimeout: 5_000 });

vi.mock('nprogress', () => ({
  default: { start: vi.fn(), done: vi.fn(), configure: vi.fn() },
}));

// ----------------------------------------------------------------------

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  localStorage.clear();
});
