import type { FakeReply } from 'src/test/fake-backend';

import { toPng } from 'html-to-image';
import { it, vi, expect, describe } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { Snackbar } from 'src/shared/ui/snackbar';
import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { ExportImageButton } from './export-image-button';

vi.mock('html-to-image', () => ({ toPng: vi.fn() }));

async function renderButton(daily: FakeReply = { status: 200, data: envelope([]) }) {
  installFakeBackend({
    'GET /usage/v1/daily': daily,
    'GET /usage/v1/models': { status: 200, data: envelope([]) },
  });
  renderWithAppProviders(
    <>
      <ExportImageButton people={[]} />
      <Snackbar />
    </>
  );
  fireEvent.click(await screen.findByTestId('export-image'));
}

describe('ExportImageButton', () => {
  it('reportsAFailedRender', async () => {
    vi.mocked(toPng).mockRejectedValueOnce(new Error('canvas tainted'));
    await renderButton();

    expect(
      await screen.findByText('Could not export the image: canvas tainted')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('export-image')).toHaveAttribute(
        'data-export-error',
        'canvas tainted'
      )
    );
    expect(screen.getByTestId('export-image')).toBeEnabled();
  });

  it('reportsAFailedReportLoad', async () => {
    await renderButton({ status: 500, data: { message: 'daily is down' } });

    expect(
      await screen.findByText('Could not export the image: daily is down')
    ).toBeInTheDocument();
    expect(screen.getByTestId('export-image')).toHaveAttribute(
      'data-export-error',
      'daily is down'
    );
    expect(toPng).not.toHaveBeenCalled();
  });
});
