import { vi } from 'vitest';

export function captureCsvDownloads() {
  const createObjectURL = vi.fn((_blob: Blob) => 'blob:csv');
  Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

  return () =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(createObjectURL.mock.calls[0][0]);
    });
}
