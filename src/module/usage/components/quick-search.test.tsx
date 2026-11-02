import { useState } from 'react';
import { useLocation } from 'react-router';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { testUser, authContextValue } from 'src/test/auth-fixtures';
import { envelope, installFakeBackend } from 'src/test/fake-backend';
import { AuthContext } from 'src/module/core/features/auth/context/auth-context';

import { QuickSearchDialog } from './quick-search';
import { ReportRangeProvider } from '../hooks/use-report-range';

const people = [
  { id: 'u-1', full_name: 'Mia', email: 'mia@example.test', is_active: true },
  { id: 'u-2', full_name: 'Raka', email: 'raka@example.test', is_active: true },
];

const session = { id: 's-1', title: 'Mi invoices', user_name: 'Mia', project: 'billing' };

function Harness() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <>
      <QuickSearchDialog open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
      <p>{`at ${pathname}`}</p>
    </>
  );
}

function renderSearch() {
  const backend = installFakeBackend({
    'GET /usage/v1/people': { status: 200, data: envelope(people) },
    'GET /usage/v1/sessions': { status: 200, data: envelope([session]) },
  });
  renderWithAppProviders(
    <AuthContext value={authContextValue({ user: { ...testUser, is_super_admin: true } })}>
      <ReportRangeProvider>
        <Harness />
      </ReportRangeProvider>
    </AuthContext>
  );
  return backend;
}

describe('QuickSearchDialog', () => {
  it('ctrlKOpensAndNavigatesToSession', async () => {
    const backend = renderSearch();
    const user = userEvent.setup();

    await screen.findByText('at /');
    await user.keyboard('{Control>}k{/Control}');
    await user.type(
      await screen.findByRole('textbox', { name: 'Search members and sessions' }),
      'mi'
    );

    expect(await screen.findByText('Mi invoices')).toBeInTheDocument();
    expect(screen.getByText('Mia')).toBeInTheDocument();
    expect(screen.queryByText('Raka')).not.toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({
        url: '/usage/v1/sessions',
        params: expect.objectContaining({ q: 'mi', per_page: '8' }),
      })
    );

    await user.keyboard('{ArrowDown}{Enter}');

    await waitFor(() => expect(screen.getByText('at /dashboard/sessions/s-1')).toBeInTheDocument());
  });

  it('enterOpensFirstMember', async () => {
    renderSearch();
    const user = userEvent.setup();

    await screen.findByText('at /');
    await user.keyboard('{Meta>}k{/Meta}');
    await user.type(
      await screen.findByRole('textbox', { name: 'Search members and sessions' }),
      'raka'
    );
    await screen.findByText('Raka');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(screen.getByText('at /dashboard/person/u-2')).toBeInTheDocument());
  });
});
