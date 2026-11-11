export type OutputUsage = {
  output_tokens: number;
  subagent_requests: number;
  subagent_output_tokens: number;
};

export type CacheUsage = {
  input_tokens: number;
  cache_write_tokens: number;
  cache_read_tokens: number;
};

export type ContextPressure = {
  sessions_near_full: number;
  compactions: number;
};

export type CodeActivity = {
  lines_added: number;
  lines_removed: number;
  commits: number;
};

export type PlanLimitUsage = {
  five_hour_used: number | null;
  five_hour_resets_at: string | null;
  seven_day_used: number | null;
  seven_day_resets_at: string | null;
  limits_captured_at: string | null;
  claude_email: string | null;
  claude_plan: string | null;
  claude_tier: string | null;
};

export type DailyUsage = {
  user_id: string;
  day: string;
  input_tokens: number;
  cache_write_tokens: number;
  cache_read_tokens: number;
  output_tokens: number;
  requests: number;
  seven_day_used: number | null;
  limit_used: number | null;
  account_weight: number;
  account_members: number;
};

export type MemberModel = {
  user_id: string;
  full_name: string;
  email: string;
  model: string;
  requests: number;
  sessions: number;
  output_tokens: number;
} & CacheUsage;

export type ToolUsage = { tool: string; calls: number } & CodeActivity;

export type Overhead = {
  system_tokens: number;
  memory_tokens: number;
  agents_tokens: number;
  skills_tokens: number;
};

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
  app_version: string | null;
  is_active?: boolean;
} & OutputUsage &
  CacheUsage &
  ContextPressure &
  CodeActivity &
  PlanLimitUsage;

export type Overview = {
  people: OverviewPerson[];
  total_new_context: number;
  total_requests: number;
  total_sessions: number;
  active_people: number;
  total_output_tokens: number;
  total_subagent_requests: number;
  total_subagent_output_tokens: number;
  total_input_tokens: number;
  total_cache_write_tokens: number;
  total_cache_read_tokens: number;
  total_sessions_near_full: number;
  total_compactions: number;
  total_lines_added: number;
  total_lines_removed: number;
  total_commits: number;
};

export type Interval = 'hour' | 'day';

export type GroupBy = 'user' | 'model';

export type TimeseriesPoint = {
  bucket: string;
  key: string;
  new_context: number;
  requests: number;
} & Partial<OutputUsage>;

export type ModelUsage = {
  model: string;
  new_context: number;
  requests: number;
  sessions: number;
} & OutputUsage &
  CacheUsage;

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
  models: string[];
} & OutputUsage &
  CacheUsage;

export type SessionHour = {
  hour: string;
  model: string;
  new_context: number;
  requests: number;
} & OutputUsage;

export type SessionDetail = {
  session: UsageSession;
  user_name: string;
  models: string[];
  hours: SessionHour[];
  overhead: Overhead | null;
  tools: ToolUsage[];
};

export type ProjectUsage = {
  project: string;
  new_context: number;
  requests: number;
  output_tokens: number;
  sessions: number;
  members: number;
  models: string[];
  overhead: Overhead | null;
} & CacheUsage &
  ContextPressure;

export type SessionSort = 'last_request_at' | '-last_request_at' | 'new_context' | '-new_context';

export type SessionsQuery = Record<string, string>;

export type Person = {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
};

export type Budget = {
  user_id: string;
  full_name: string;
  email: string;
  monthly_new_context: number | null;
  used_new_context: number;
  month_start: string;
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
