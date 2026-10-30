export type ApiEnvelope<T> = {
  data: T | null;
  message: string;
  meta?: { pagination?: Pagination } | null;
  errors?: unknown;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type Paged<T> = {
  items: T[];
  pagination: Pagination;
};

export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const res = await promise;
  const payload = res.data;
  if (payload.data === null || payload.data === undefined) {
    throw new Error(payload.message || 'Empty response');
  }
  return payload.data;
}

export async function unwrapList<T>(
  promise: Promise<{ data: ApiEnvelope<T[]> }>
): Promise<Paged<T>> {
  const res = await promise;
  const items = res.data.data ?? [];
  const pagination = res.data.meta?.pagination ?? {
    page: 1,
    limit: items.length,
    total: items.length,
    total_pages: 1,
  };
  return { items, pagination };
}
