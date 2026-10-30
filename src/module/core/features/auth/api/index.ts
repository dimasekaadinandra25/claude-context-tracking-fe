import type { TokenPair, MeResponse, SignInParams, SignInResponse } from '../types';

import { unwrap } from 'src/shared/api';
import axios, { endpoints, withoutAuthRefresh } from 'src/shared/lib/axios';

export function signIn(params: SignInParams) {
  return unwrap<SignInResponse>(axios.post(endpoints.auth.signIn, params, withoutAuthRefresh()));
}

export function refreshTokens(refresh_token: string) {
  return unwrap<TokenPair>(
    axios.post(endpoints.auth.refresh, { refresh_token }, withoutAuthRefresh())
  );
}

export function logout(refresh_token: string) {
  return axios.post(endpoints.auth.logout, { refresh_token });
}

export function getMe() {
  return unwrap<MeResponse>(axios.get(endpoints.auth.me));
}
