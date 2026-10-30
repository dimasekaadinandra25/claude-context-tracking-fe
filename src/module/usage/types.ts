export type OverviewPerson = {
  user_id: string;
  full_name: string;
  email: string;
  current_model: string;
  new_context: number;
  requests: number;
  sessions: number;
  last_request_at: string | null;
  last_synced_at: string | null;
};

export type Overview = {
  people: OverviewPerson[];
  total_new_context: number;
  total_requests: number;
  total_sessions: number;
  active_people: number;
};

export type Interval = 'hour' | 'day';

export type GroupBy = 'user' | 'model';

export type TimeseriesPoint = {
  bucket: string;
  key: string;
  new_context: number;
  requests: number;
};

export type ModelUsage = {
  model: string;
  new_context: number;
  requests: number;
  sessions: number;
};

export type UsageSession = {
  id: string;
  user_id: string;
  machine: string;
  project: string;
  title: string;
  model: string;
  context_window: number;
  start_context: number;
  latest_context: number;
  peak_context: number;
  new_context: number;
  requests: number;
  compactions: number;
  first_request_at: string;
  last_request_at: string;
  last_reported_at: string;
  user_name?: string;
};

export type SessionHour = {
  hour: string;
  model: string;
  new_context: number;
  requests: number;
};

export type SessionDetail = {
  session: UsageSession;
  user_name: string;
  hours: SessionHour[];
};

export type SessionSort = 'last_request_at' | '-last_request_at' | 'new_context' | '-new_context';

export type SessionsQuery = Record<string, string>;

export type Person = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
};

export type AdminUser = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_email_verified: boolean;
  roles: string[];
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateUserBody = {
  email: string;
  username: string;
  full_name: string;
  password: string;
};

export type ApiKey = {
  id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  is_active: boolean;
  revoked_at?: string | null;
  created_at: string;
};

export type IssuedKey = {
  id: string;
  key: string;
  key_prefix: string;
  name: string;
};
