// ----------------------------------------------------------------------

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Unsigned JWT for tests; only the payload is read by the app. */
export function makeJwt(payload: Record<string, unknown>): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  return `${header}.${base64Url(JSON.stringify(payload))}.signature`;
}

/** JWT whose `exp` is `secondsFromNow` from the current (possibly faked) clock. */
export function makeJwtExpiringIn(secondsFromNow: number): string {
  return makeJwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + secondsFromNow });
}
