import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';

import { AuthSplitSection } from './section';

describe('AuthSplitSection', () => {
  it('shows the product tagline instead of the starter copy', async () => {
    renderWithAppProviders(<AuthSplitSection title="Claude Usage" />);

    expect(
      await screen.findByText('Track Claude Code context usage across your team.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/optimized workflows/)).not.toBeInTheDocument();
  });
});
