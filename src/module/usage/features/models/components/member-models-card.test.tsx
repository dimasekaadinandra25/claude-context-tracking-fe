import type { MemberModel } from 'src/module/usage/types';

import { it, expect, describe } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithAppProviders } from 'src/test/render';
import { installFakeBackend } from 'src/test/fake-backend';

import { MemberModelsCard } from './member-models-card';

const row = (fields: Partial<MemberModel>): MemberModel => ({
  user_id: 'a',
  full_name: 'Mia',
  email: 'mia@test.local',
  model: 'claude-opus-5-5',
  requests: 1,
  sessions: 1,
  input_tokens: 0,
  cache_write_tokens: 0,
  cache_read_tokens: 0,
  output_tokens: 0,
  ...fields,
});

describe('MemberModelsCard', () => {
  it('showsEachMembersModelSplitAndRequests', async () => {
    installFakeBackend({});
    renderWithAppProviders(
      <MemberModelsCard
        rows={[
          row({ requests: 30, cache_read_tokens: 900 }),
          row({ model: 'claude-haiku-5-5', requests: 4, input_tokens: 100 }),
          row({ user_id: 'b', full_name: 'Raka', requests: 2, input_tokens: 50 }),
        ]}
      />
    );

    expect(await screen.findByText('Models by member')).toBeInTheDocument();
    expect(screen.getByText('Opus 5.5')).toBeInTheDocument();
    expect(screen.getByText('Haiku 5.5')).toBeInTheDocument();
    expect(
      screen.getByText(`${(90).toLocaleString(undefined, { minimumFractionDigits: 1 })}%`)
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${(100).toLocaleString(undefined, { minimumFractionDigits: 1 })}%`)
    ).toBeInTheDocument();
    expect(screen.getByText('30 req')).toBeInTheDocument();
    expect(screen.getByText('Raka')).toBeInTheDocument();
  });
});
