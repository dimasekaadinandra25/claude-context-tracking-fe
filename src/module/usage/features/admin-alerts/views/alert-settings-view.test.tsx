import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { Snackbar } from 'src/shared/ui/snackbar';
import { renderWithAppProviders } from 'src/test/render';
import { envelope, installFakeBackend } from 'src/test/fake-backend';

import { AlertSettingsView } from './alert-settings-view';

const ok = (data: unknown) => ({ status: 200, data: envelope(data) });

function renderWith(stored: unknown) {
  const backend = installFakeBackend({
    'GET /usage/v1/alert-settings': ok(stored),
    'PUT /usage/v1/alert-settings': (request) => ok(request.body),
  });
  renderWithAppProviders(
    <>
      <AlertSettingsView />
      <Snackbar />
    </>
  );
  return { backend, user: userEvent.setup() };
}

const saved = (backend: ReturnType<typeof renderWith>['backend']) =>
  backend.requests.filter((r) => r.method === 'PUT').map((r) => r.body);

const checkbox = (label: string) => screen.getByRole('checkbox', { name: new RegExp(`^${label}`) });

describe('AlertSettingsView', () => {
  it('showsDefaultsWhenNothingIsStoredAndSavesChanges', async () => {
    const { backend, user } = renderWith(null);

    expect(await screen.findByText(/Nothing saved yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '80%' })).toBeInTheDocument();
    expect(checkbox('Pace')).toBeChecked();
    expect(checkbox('App version')).toBeChecked();

    await user.click(checkbox('Pace'));
    screen.getByRole('button', { name: '90%' }).focus();
    await user.keyboard('{Delete}');
    expect(screen.queryByRole('button', { name: '90%' })).not.toBeInTheDocument();
    await user.type(screen.getByRole('spinbutton', { name: 'Percent' }), '95');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    const runaway = screen.getByRole('spinbutton', { name: /Runaway share/ });
    await user.clear(runaway);
    await user.type(runaway, '10');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Alert settings saved')).toBeInTheDocument();
    expect(saved(backend)).toEqual([
      {
        alerts: '80,95,summary,stale,runaway,project,budget,version',
        runaway_share: 10,
        project_share: 40,
      },
    ]);
    await waitFor(() => expect(screen.queryByText(/Nothing saved yet/)).not.toBeInTheDocument());
  });

  it('loadsStoredValuesAndResetsToDefaults', async () => {
    const { backend, user } = renderWith({
      alerts: '95,stale',
      runaway_share: 9,
      project_share: 30,
    });

    expect(await screen.findByRole('button', { name: '95%' })).toBeInTheDocument();
    expect(screen.queryByText(/Nothing saved yet/)).not.toBeInTheDocument();
    expect(checkbox('Stale app')).toBeChecked();
    expect(checkbox('Pace')).not.toBeChecked();
    expect(screen.getByRole('spinbutton', { name: /Project share/ })).toHaveValue(30);

    await user.click(screen.getByRole('button', { name: 'Reset to defaults' }));
    expect(checkbox('Pace')).toBeChecked();
    expect(screen.queryByRole('button', { name: '95%' })).not.toBeInTheDocument();
    expect(saved(backend)).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByText('Alert settings saved');
    expect(saved(backend)).toEqual([
      {
        alerts: '80,90,pace,summary,stale,runaway,project,budget,version',
        runaway_share: 5,
        project_share: 40,
      },
    ]);
  });

  it('blocksSaveOnAShareOutsideOneToHundred', async () => {
    const { backend, user } = renderWith(null);

    const project = await screen.findByRole('spinbutton', { name: /Project share/ });
    await user.clear(project);
    await user.type(project, '0');

    expect(screen.getByText('Enter a whole number from 1 to 100.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
    expect(saved(backend)).toEqual([]);
  });
});
