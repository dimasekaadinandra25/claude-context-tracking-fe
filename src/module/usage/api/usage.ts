import type { Paged } from 'src/shared/api';
import type { ReportRange } from '../utils/range';
import type {
  ApiKey,
  Budget,
  Person,
  GroupBy,
  Interval,
  Overview,
  AdminUser,
  IssuedKey,
  ToolUsage,
  CacheUsage,
  DailyUsage,
  ModelUsage,
  OutputUsage,
  ProjectUsage,
  UsageSession,
  SessionDetail,
  SessionsQuery,
  CreateUserBody,
  TimeseriesPoint,
} from '../types';

import { unwrap, unwrapList } from 'src/shared/api';
import axios, { endpoints } from 'src/shared/lib/axios';

import { buildRangeParams } from '../utils/range';

const ADMIN_USERS_LIMIT = 1000;
const KEYS_LIMIT = 100;

const NO_OUTPUT: OutputUsage = {
  output_tokens: 0,
  subagent_requests: 0,
  subagent_output_tokens: 0,
};

const NO_CACHE: CacheUsage = {
  input_tokens: 0,
  cache_write_tokens: 0,
  cache_read_tokens: 0,
};

const NO_PRESSURE = { sessions_near_full: 0, compactions: 0 };

const NO_ACTIVITY = { lines_added: 0, lines_removed: 0, commits: 0 };

const NO_LIMITS = {
  five_hour_used: null,
  five_hour_resets_at: null,
  seven_day_used: null,
  seven_day_resets_at: null,
  limits_captured_at: null,
  claude_email: null,
  claude_plan: null,
  claude_tier: null,
};

const NO_TOTALS = {
  total_output_tokens: 0,
  total_subagent_requests: 0,
  total_subagent_output_tokens: 0,
  total_input_tokens: 0,
  total_cache_write_tokens: 0,
  total_cache_read_tokens: 0,
  total_sessions_near_full: 0,
  total_compactions: 0,
  total_lines_added: 0,
  total_lines_removed: 0,
  total_commits: 0,
};

const withOutput = <T extends OutputUsage>(row: T): T => ({ ...NO_OUTPUT, ...row });

const withSession = (row: UsageSession): UsageSession => withOutput({ ...NO_CACHE, ...row });

function rangeParams(range: ReportRange, userId?: string) {
  return userId ? { ...buildRangeParams(range), user_id: userId } : buildRangeParams(range);
}

export async function getOverview(range: ReportRange, userId?: string): Promise<Overview> {
  const overview = await unwrap<Overview>(
    axios.get(endpoints.usage.overview, { params: rangeParams(range, userId) })
  );
  return {
    ...NO_TOTALS,
    ...overview,
    people: overview.people.map((p) => ({
      ...NO_CACHE,
      ...NO_PRESSURE,
      ...NO_ACTIVITY,
      ...NO_LIMITS,
      ...withOutput(p),
      app_version: p.app_version ?? null,
    })),
  };
}

export function getTimeseries(
  range: ReportRange,
  interval: Interval,
  groupBy: GroupBy,
  userId?: string
) {
  return unwrap<TimeseriesPoint[]>(
    axios.get(endpoints.usage.timeseries, {
      params: { ...rangeParams(range, userId), interval, group_by: groupBy },
    })
  );
}

export async function getModels(range: ReportRange, userId?: string) {
  const models = await unwrap<ModelUsage[]>(
    axios.get(endpoints.usage.models, { params: rangeParams(range, userId) })
  );
  return models.map((model) => withOutput({ ...NO_CACHE, ...model }));
}

export function getTools(range: ReportRange, userId?: string) {
  return unwrap<ToolUsage[]>(
    axios.get(endpoints.usage.tools, { params: rangeParams(range, userId) })
  );
}

export function getDaily(range: ReportRange, userId?: string) {
  return unwrap<DailyUsage[]>(
    axios.get(endpoints.usage.daily, { params: rangeParams(range, userId) })
  );
}

export async function getSessions(
  range: ReportRange,
  query: SessionsQuery
): Promise<Paged<UsageSession>> {
  const page = await unwrapList<UsageSession>(
    axios.get(endpoints.usage.sessions, { params: { ...buildRangeParams(range), ...query } })
  );
  return { ...page, items: page.items.map(withSession) };
}

export async function getSession(id: string): Promise<SessionDetail> {
  const detail = await unwrap<SessionDetail>(axios.get(endpoints.usage.session(id)));
  return {
    ...detail,
    session: withSession(detail.session),
    hours: (detail.hours ?? []).map(withOutput),
    overhead: detail.overhead ?? null,
    tools: detail.tools ?? [],
  };
}

export async function getProjects(range: ReportRange, userId?: string) {
  const projects = await unwrap<ProjectUsage[]>(
    axios.get(endpoints.usage.projects, { params: rangeParams(range, userId) })
  );
  return projects.map((p) => ({
    ...NO_CACHE,
    ...NO_PRESSURE,
    ...p,
    models: p.models ?? [],
    overhead: p.overhead ?? null,
  }));
}

export function getPeople() {
  return unwrap<Person[]>(axios.get(endpoints.usage.people));
}

export function getBudgets(tz: string) {
  return unwrap<Budget[]>(axios.get(endpoints.usage.budgets, { params: { tz } }));
}

export async function adminSetBudget(userId: string, monthlyNewContext: number) {
  await axios.put(endpoints.usage.budget(userId), { monthly_new_context: monthlyNewContext });
}

export async function adminDeleteBudget(userId: string) {
  await axios.delete(endpoints.usage.budget(userId));
}

export async function adminListUsers() {
  const res = await unwrapList<AdminUser>(
    axios.get(endpoints.admin.users, { params: { limit: ADMIN_USERS_LIMIT } })
  );
  return res.items;
}

export function adminCreateUser(body: CreateUserBody) {
  return unwrap<AdminUser>(axios.post(endpoints.admin.users, body));
}

export async function adminSetActive(id: string, active: boolean) {
  await axios.post(active ? endpoints.admin.activate(id) : endpoints.admin.deactivate(id));
}

export async function adminResetPassword(id: string, password: string) {
  await axios.post(endpoints.admin.resetPassword(id), { password });
}

export function adminIssueKey(userId: string, name: string) {
  return unwrap<IssuedKey>(axios.post(endpoints.admin.apiKeys(userId), { name }));
}

export async function adminListKeys(userId: string) {
  const res = await unwrap<{ api_keys: ApiKey[] }>(
    axios.get(endpoints.admin.apiKeys(userId), { params: { limit: KEYS_LIMIT } })
  );
  return res.api_keys;
}

export async function adminRevokeKey(keyId: string) {
  await axios.post(endpoints.admin.revokeKey(keyId));
}

export async function adminRevealKey(keyId: string) {
  const res = await unwrap<{ key: string }>(axios.get(endpoints.admin.revealKey(keyId)));
  return res.key;
}
