import type { User } from 'oidc-client-ts';
import type { UmsConfigSnapshot } from './types';

export type PosUmsInfoResult = {
  ok: boolean;
  status: number;
  data: unknown;
};

type PosUmsInfoCache = {
  cacheKey: string;
  result: PosUmsInfoResult;
};

let posUmsInfoCache: PosUmsInfoCache | null = null;
let posUmsInfoPromise: Promise<PosUmsInfoResult> | null = null;
let posUmsInfoPromiseKey = '';

function getPosUmsInfoCacheKey(user: User, config: UmsConfigSnapshot): string {
  return `${config.apiBaseUrl}:${user.profile?.sub || ''}:${user.access_token}`;
}

export async function getPosUmsInfo(user: User, config: UmsConfigSnapshot): Promise<PosUmsInfoResult> {
  const response = await fetch(`${config.apiBaseUrl}/api/v1/user/info`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${user.access_token}`,
    },
  });

  const data = await response.json().catch(() => null);

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function ensurePosUmsInfo(user: User, config: UmsConfigSnapshot): Promise<PosUmsInfoResult> {
  const cacheKey = getPosUmsInfoCacheKey(user, config);

  if (posUmsInfoCache?.cacheKey === cacheKey) {
    return posUmsInfoCache.result;
  }

  if (posUmsInfoPromise && posUmsInfoPromiseKey === cacheKey) {
    return posUmsInfoPromise;
  }

  posUmsInfoPromiseKey = cacheKey;
  posUmsInfoPromise = getPosUmsInfo(user, config)
    .then((result) => {
      if (result.ok) {
        posUmsInfoCache = {
          cacheKey,
          result,
        };
      }
      return result;
    })
    .finally(() => {
      if (posUmsInfoPromiseKey === cacheKey) {
        posUmsInfoPromise = null;
        posUmsInfoPromiseKey = '';
      }
    });

  return posUmsInfoPromise;
}

export function clearPosUmsInfoCache(): void {
  posUmsInfoCache = null;
  posUmsInfoPromise = null;
  posUmsInfoPromiseKey = '';
}
