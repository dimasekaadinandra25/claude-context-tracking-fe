import type { OverviewPerson } from 'src/module/usage/types';

import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { installFakeBackend } from 'src/test/fake-backend';

import { ActivityCard } from './activity-card';
import { limitColor, PlanLimitsCard } from './plan-limits';

const tools = [
  { tool: 'Bash', calls: 1200, lines_added: 0, lines_removed: 0, commits: 4 },
  { tool: 'Edit', calls: 300, lines_added: 950, lines_removed: 210, commits: 0 },
];

const person = (fields: Partial<OverviewPerson>) =>
  ({
    five_hour_used: null,
    five_hour_resets_at: null,
    seven_day_used: null,
    seven_day_resets_at: null,
    limits_captured_at: null,
    ...fields,
  }) as OverviewPerson;

describe('ActivityCard', () => {
  it('showsLinesCommitsTokensPerCommitAndTools', async () => {
    installFakeBackend({});
    renderWithAppProviders(
      <ActivityCard
        linesAdded={950}
        linesRemoved={210}
        commits={4}
        outputTokens={80_000}
        tools={tools}
      />
    );

    expect(await screen.findByText('+950')).toBeInTheDocument();
    expect(screen.getByText('-210')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('20K')).toBeInTheDocument();
    expect(screen.getByText('Bash')).toBeInTheDocument();
    expect(screen.getByText((1200).toLocaleString())).toBeInTheDocument();
  });

  it('hidesTokensPerCommitWithoutCommits', async () => {
    installFakeBackend({});
    renderWithAppProviders(
      <ActivityCard linesAdded={5} linesRemoved={0} commits={0} outputTokens={100} tools={[]} />
    );

    expect(await screen.findByText('+5')).toBeInTheDocument();
    expect(screen.queryByText('Output tokens per commit')).not.toBeInTheDocument();
  });

  it('explainsAnEmptyCard', async () => {
    installFakeBackend({});
    renderWithAppProviders(<ActivityCard linesAdded={0} linesRemoved={0} commits={0} tools={[]} />);

    expect(await screen.findByText(/No code activity in this range/)).toBeInTheDocument();
  });
});

describe('PlanLimitsCard', () => {
  it('rendersNothingWithoutLimits', () => {
    installFakeBackend({});
    const { container } = renderWithAppProviders(<PlanLimitsCard person={person({})} />);

    expect(container.textContent).not.toContain('Plan limits');
  });

  it('showsOnlyTheWindowsThatAreLive', async () => {
    installFakeBackend({});
    renderWithAppProviders(
      <PlanLimitsCard
        person={person({
          seven_day_used: 41.6,
          seven_day_resets_at: '2099-01-01T00:00:00Z',
          limits_captured_at: '2026-01-01T00:00:00Z',
        })}
      />
    );

    expect(await screen.findByText('Plan limits')).toBeInTheDocument();
    expect(screen.getByText('42% used')).toBeInTheDocument();
    expect(screen.queryByText('5-hour window')).not.toBeInTheDocument();
  });

  it('warnsAt80AndAlertsAt90', () => {
    expect(limitColor(79.9)).toBe('primary');
    expect(limitColor(80)).toBe('warning');
    expect(limitColor(90)).toBe('error');
  });
});
