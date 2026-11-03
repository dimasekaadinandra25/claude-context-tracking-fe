import type { OverviewPerson } from 'src/module/usage/types';

import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { installFakeBackend } from 'src/test/fake-backend';

import { PersonPressureCard, ContextPressureCard } from './context-pressure-card';

const member = (
  user_id: string,
  full_name: string,
  sessions_near_full: number,
  compactions: number
) => ({ user_id, full_name, email: `${user_id}@example.test`, sessions_near_full, compactions });

const asPeople = (rows: ReturnType<typeof member>[]) => rows as unknown as OverviewPerson[];

function renderCard(people: ReturnType<typeof member>[]) {
  installFakeBackend({});
  renderWithAppProviders(<ContextPressureCard people={asPeople(people)} />);
}

describe('ContextPressureCard', () => {
  it('sortsByNearFullAndHidesQuietMembers', async () => {
    renderCard([
      member('u-1', 'Mia', 1, 9),
      member('u-2', 'Raka', 0, 0),
      member('u-3', 'Sari', 4, 2),
      member('u-4', 'Budi', 0, 3),
    ]);

    const rows = await screen.findAllByRole('row');
    expect(rows.slice(1).map((r) => r.textContent)).toEqual(['Sari42', 'Mia19', 'Budi03']);
    expect(screen.queryByText('Raka')).not.toBeInTheDocument();
  });

  it('showsEmptyStateWhenNoPressure', async () => {
    renderCard([member('u-1', 'Mia', 0, 0)]);

    expect(
      await screen.findByText('No sessions came close to their context limit in this range.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Mia')).not.toBeInTheDocument();
  });
});

describe('PersonPressureCard', () => {
  it('showsTheMembersOwnNumbers', async () => {
    installFakeBackend({});
    renderWithAppProviders(
      <PersonPressureCard person={asPeople([member('u-1', 'Mia', 3, 5)])[0]} />
    );

    expect(await screen.findByText('Context pressure')).toBeInTheDocument();
    expect(screen.getByText('Near-full sessions').nextSibling).toHaveTextContent('3');
    expect(screen.getByText('Compactions').nextSibling).toHaveTextContent('5');
  });
});
