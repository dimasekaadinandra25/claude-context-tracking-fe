import { it, vi, expect, describe } from 'vitest';
import { within, screen, waitFor, fireEvent } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { captureCsvDownloads } from 'src/test/csv-export';
import { testUser, authContextValue } from 'src/test/auth-fixtures';
import { envelope, installFakeBackend } from 'src/test/fake-backend';
import { AuthContext } from 'src/module/core/features/auth/context/auth-context';

import { ProjectsView } from './projects-view';
import { ReportRangeProvider } from '../../../hooks/use-report-range';

const billing = {
  project: 'billing',
  new_context: 48210,
  requests: 1234,
  output_tokens: 9000,
  input_tokens: 1000,
  cache_write_tokens: 1000,
  cache_read_tokens: 8000,
  sessions: 3,
  members: 2,
  models: ['claude-opus-4-1'],
  compactions: 4,
  sessions_near_full: 2,
  overhead: { system_tokens: 8000, memory_tokens: 2000, agents_tokens: 1500, skills_tokens: 500 },
};

const privateSessions = {
  ...billing,
  project: '',
  new_context: 1000,
  input_tokens: 0,
  cache_write_tokens: 0,
  cache_read_tokens: 0,
  overhead: null,
};

const GRID_READY = { timeout: 5000 };

function renderProjects(isAdmin = false) {
  const backend = installFakeBackend({
    'GET /usage/v1/projects': { status: 200, data: envelope([billing, privateSessions]) },
    'GET /usage/v1/people': { status: 200, data: envelope([]) },
  });
  const view = (
    <ReportRangeProvider>
      <ProjectsView />
    </ReportRangeProvider>
  );
  renderWithAppProviders(
    isAdmin ? (
      <AuthContext value={authContextValue({ user: { ...testUser, is_super_admin: true } })}>
        {view}
      </AuthContext>
    ) : (
      view
    )
  );
  return backend;
}

const rowOf = (name: string) =>
  screen.getByRole('gridcell', { name }).closest('[role="row"]') as HTMLElement;

describe('ProjectsView', () => {
  it('rendersProjectRowsWithLinksAndOverhead', async () => {
    const backend = renderProjects();

    const link = await screen.findByRole('link', { name: 'billing' }, GRID_READY);
    expect(link).toHaveAttribute('href', '/dashboard/sessions?project=billing');
    expect(within(rowOf('billing')).getByRole('gridcell', { name: '80%' })).toBeInTheDocument();
    expect(within(rowOf('billing')).getByRole('img', { name: '12K' })).toBeInTheDocument();

    const privateRow = rowOf('Private sessions');
    expect(within(privateRow).queryByRole('link')).not.toBeInTheDocument();
    expect(within(privateRow).getAllByRole('gridcell', { name: '—' })).toHaveLength(2);

    expect(screen.queryByRole('columnheader', { name: 'Members' })).not.toBeInTheDocument();
    expect(backend.requests).toContainEqual(
      expect.objectContaining({
        url: '/usage/v1/projects',
        params: expect.not.objectContaining({ user_id: expect.anything() }),
      })
    );
  });

  it('overheadTooltipListsTheFourParts', async () => {
    renderProjects();

    fireEvent.mouseOver(await screen.findByRole('img', { name: '12K' }, GRID_READY));

    expect(await screen.findByText('System prompt & tools')).toBeInTheDocument();
    expect(screen.getByText('Memory files')).toBeInTheDocument();
    expect(screen.getByText('Agents')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('1.5K')).toBeInTheDocument();
  });
});

describe('ProjectsView admin and export', () => {
  it('adminSeesMembersColumnAndFilter', async () => {
    renderProjects(true);

    expect(
      await screen.findByRole('columnheader', { name: 'Members' }, GRID_READY)
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Member' })).toBeInTheDocument();
  });

  it('projectsCsvExportsRawValues', async () => {
    const readCsv = captureCsvDownloads();
    renderProjects();

    await screen.findByRole('link', { name: 'billing' }, GRID_READY);
    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    const csv = await readCsv();

    const click = vi.mocked(HTMLAnchorElement.prototype.click);
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('projects.csv');
    expect(csv).toContain('48210');
    expect(csv).toContain('12000');
    expect(csv).toContain('Private sessions');
    expect(csv).not.toContain('48.2K');
  });
});
