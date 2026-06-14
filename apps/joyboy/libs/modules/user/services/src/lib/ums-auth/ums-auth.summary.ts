import type { User } from 'oidc-client-ts';

export function getPosUmsUserSummary(user: User | null) {
  if (!user) {
    return {
      loggedIn: false,
      message: 'No OIDC user found in localStorage.',
    };
  }

  return {
    loggedIn: true,
    expired: user.expired,
    expires_in: user.expires_in,
    scope: user.scope,
    token_type: user.token_type,
    has_access_token: Boolean(user.access_token),
    has_id_token: Boolean(user.id_token),
    has_refresh_token: Boolean(user.refresh_token),
    profile: {
      sub: user.profile?.sub,
      name: user.profile?.name,
      email: user.profile?.email,
    },
  };
}
