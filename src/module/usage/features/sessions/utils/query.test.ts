import { it, expect, describe } from 'vitest';

import { sessionsQueryFromGrid } from './query';

describe('sessionsQueryFromGrid', () => {
  it('sessionsQueryFromGrid', () => {
    const query = sessionsQueryFromGrid({
      page: 2,
      pageSize: 25,
      sortModel: [{ field: 'new_context', sort: 'desc' }],
      filters: { userId: 'u-1', project: 'C:\\Code\\App', model: 'claude-opus-5-5', q: 'design' },
    });

    expect(new URLSearchParams(query).toString()).toBe(
      'page=3&per_page=25&sort=-new_context&user_id=u-1&project=C%3A%5CCode%5CApp&model=claude-opus-5-5&q=design'
    );
  });

  it('drops empty filters and sorts by newest last request by default', () => {
    const query = sessionsQueryFromGrid({
      page: 0,
      pageSize: 10,
      sortModel: [],
      filters: { userId: '', project: '  ', q: '' },
    });

    expect(query).toEqual({ page: '1', per_page: '10', sort: '-last_request_at' });
  });

  it('sorts ascending by last request', () => {
    const query = sessionsQueryFromGrid({
      page: 0,
      pageSize: 25,
      sortModel: [{ field: 'last_request_at', sort: 'asc' }],
      filters: {},
    });

    expect(query.sort).toBe('last_request_at');
  });
});
