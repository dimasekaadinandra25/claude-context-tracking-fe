import type { Paged } from 'src/shared/api';
import type { ReportRange } from '../utils/range';
import type {
  ApiKey,
  Person,
  GroupBy,
  Interval,
  Overview,
  AdminUser,
  IssuedKey,
  ModelUsage,
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

function rangeParams(range: ReportRange, userId?: string) {
  return userId ? { ...buildRangeParams(range), user_id: userId } : buildRangeParams(range);
}

export function getOverview(range: ReportRange, userId?: string) {
  return unwrap<Overview>(
    axios.get(endpoints.usage.overview, { params: rangeParams(range, userId) })
  );
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

export function getModels(range: ReportRange, userId?: string) {
  return unwrap<ModelUsage[]>(
    axios.get(endpoints.usage.models, { params: rangeParams(range, userId) })
  );
}

export function getSessions(
  range: ReportRange,
  query: SessionsQuery
): Promise<Paged<UsageSession>> {
  return unwrapList<UsageSession>(
    axios.get(endpoints.usage.sessions, { params: { ...buildRangeParams(range), ...query } })
  );
}

export function getSession(id: string) {
  return unwrap<SessionDetail>(axios.get(endpoints.usage.session(id)));
}

export function getPeople() {
  return unwrap<Person[]>(axios.get(endpoints.usage.people));
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
