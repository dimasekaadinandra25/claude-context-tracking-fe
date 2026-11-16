import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';

import { FreshnessStamp } from './freshness-stamp';

const updatedAt = new Date(2026, 10, 16, 9, 5).getTime();

describe('FreshnessStamp', () => {
  it('showsTheLastRefreshTime', async () => {
    renderWithAppProviders(<FreshnessStamp updatedAt={updatedAt} error={null} />);

    expect(await screen.findByText('Updated 09:05 · refreshes every minute')).toBeInTheDocument();
    expect(screen.queryByText(/Couldn't refresh/)).not.toBeInTheDocument();
  });

  it('warnsWhenTheLatestRefreshFailed', async () => {
    renderWithAppProviders(<FreshnessStamp updatedAt={updatedAt} error="offline" />);

    expect(
      await screen.findByText("Couldn't refresh — showing data from 09:05")
    ).toBeInTheDocument();
  });

  it('rendersNothingBeforeTheFirstLoad', () => {
    renderWithAppProviders(<FreshnessStamp error="offline" />);

    expect(screen.queryByText(/freshness|Updated|refresh/)).not.toBeInTheDocument();
  });
});
