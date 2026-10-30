export type User = {
  id: string;
  email: string;
  username: string;
  full_name: string;
};

export type AuthUser = User & {
  is_super_admin: boolean;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
};

export type SignInResponse = TokenPair & {
  user: User;
  roles: string[];
  permissions: string[] | null;
};

export type MeResponse = {
  user: User;
  roles: string[];
  permissions: string[] | null;
  is_super_admin: boolean;
};

export type AuthState = {
  loading: boolean;
  user: AuthUser | null;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type AuthContextValue = AuthState & {
  authenticated: boolean;
  unauthenticated: boolean;
  signIn: (params: SignInParams) => Promise<void>;
  signOut: () => Promise<void>;
  checkUserSession: () => Promise<void>;
};
