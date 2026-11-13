import type { DailyUsage, OverviewPerson } from 'src/module/usage/types';

import { inputOf, isShared, weightOf, hasTokens, memberCost } from './plan';

export type MemberUsage = {
  person: OverviewPerson;
  days: Map<string, DailyUsage>;
  input: number;
  output: number;
  weight: number;
  requests: number;
  cost: number | null;
};

export function memberRows(people: OverviewPerson[], daily: DailyUsage[]): MemberUsage[] {
  const byUser = new Map<string, DailyUsage[]>();
  daily.forEach((row) => byUser.set(row.user_id, [...(byUser.get(row.user_id) ?? []), row]));

  return people
    .filter((person) =>
      (byUser.get(person.user_id) ?? []).some((row) => hasTokens(row) || !isShared(row))
    )
    .map((person) => {
      const rows = byUser.get(person.user_id) ?? [];
      const costs = rows
        .map((row) => memberCost(row, person.claude_tier ?? null))
        .filter((cost): cost is number => cost !== null);
      return {
        person,
        days: new Map(rows.map((row) => [row.day, row])),
        input: rows.reduce((total, row) => total + inputOf(row), 0),
        output: rows.reduce((total, row) => total + row.output_tokens, 0),
        weight: rows.reduce((total, row) => total + weightOf(row), 0),
        requests: rows.reduce((total, row) => total + row.requests, 0),
        cost: costs.length > 0 ? costs.reduce((total, cost) => total + cost, 0) : null,
      };
    })
    .sort((a, b) => b.weight - a.weight);
}
