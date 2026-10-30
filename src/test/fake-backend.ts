import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { AxiosError } from 'axios';

import axiosInstance from 'src/shared/lib/axios';

// ----------------------------------------------------------------------

export type FakeReply = { status: number; data: unknown };

export type FakeRoute = FakeReply | ((request: RecordedRequest) => FakeReply);

export type RecordedRequest = {
  method: string;
  url: string;
  body: unknown;
  authorization: string | undefined;
};

const HTTP_BAD_REQUEST = 400;

function record(config: InternalAxiosRequestConfig): RecordedRequest {
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  const authorization = config.headers.get('Authorization');
  return {
    method: (config.method ?? 'get').toUpperCase(),
    url: config.url ?? '',
    body,
    authorization: typeof authorization === 'string' ? authorization : undefined,
  };
}

/**
 * Replaces the network layer of the shared axios instance: every request is
 * answered from `routes` (key `"<METHOD> <url>"`) and recorded, while the
 * interceptors in src/shared/lib/axios.ts still run. Unknown routes get 404.
 */
export function installFakeBackend(routes: Record<string, FakeRoute>) {
  const requests: RecordedRequest[] = [];
  delete axiosInstance.defaults.headers.common.Authorization;

  axiosInstance.defaults.adapter = async (config) => {
    const request = record(config);
    requests.push(request);
    const route = routes[`${request.method} ${request.url}`];
    const reply =
      typeof route === 'function'
        ? route(request)
        : (route ?? { status: 404, data: { message: `no fake route for ${request.url}` } });
    const response: AxiosResponse = { ...reply, statusText: '', headers: {}, config };
    if (reply.status >= HTTP_BAD_REQUEST) {
      throw new AxiosError('fake backend error', String(reply.status), config, null, response);
    }
    return response;
  };

  return { requests };
}

export function envelope(data: unknown, message = 'ok') {
  return { data, message };
}
