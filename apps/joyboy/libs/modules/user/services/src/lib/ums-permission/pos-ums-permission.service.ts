import {
  resetPosUmsPermission,
  resetPosUmsUserInfo,
  setPosUmsPermissionError,
  setPosUmsPermissionLoading,
  setPosUmsPermissionReady,
  setPosUmsPermissionUnauthenticated,
  setPosUmsUserInfo,
  type PosUmsPermissionState,
} from '@castlery/modules-user-domain';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ensurePosUmsInfo } from '../ums-auth/ums-api';
import { PosUmsAuthService } from '../ums-auth/ums-auth.service';
import { getPosUmsPermissionMarket, normalizeCurrentMarketPermissions } from './pos-ums-permission.helper';

type SyncPosUmsPermissionsArgs = {
  locale: string;
};

type PosUmsPermissionSnapshot = PosUmsPermissionState & {
  umsUserInfo?: {
    name: string;
    email: string;
  } | null;
};

const POS_UMS_GET_USER_TIMEOUT_MS = 8000;
const POS_UMS_INFO_TIMEOUT_MS = 8000;

function createTimeoutError(message: string) {
  return new Error(message);
}

function normalizePosUmsUserInfo(data: unknown): { name: string; email: string } | null {
  const source = data as { data?: { name?: unknown; email?: unknown } } | null | undefined;
  const name = typeof source?.data?.name === 'string' ? source.data.name.trim() : '';
  const email = typeof source?.data?.email === 'string' ? source.data.email.trim() : '';

  if (!name && !email) {
    return null;
  }

  return {
    name,
    email,
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(createTimeoutError(message));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function loadPosUmsPermissionSnapshot(locale: string): Promise<PosUmsPermissionSnapshot> {
  const market = getPosUmsPermissionMarket(locale);
  const authService = PosUmsAuthService.getInstance(locale);
  let user = null;

  try {
    user = await withTimeout(
      authService.getValidUser(),
      POS_UMS_GET_USER_TIMEOUT_MS,
      'Timed out while loading POS UMS user.'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'Timed out while loading POS UMS user.') {
      return {
        status: 'unauthenticated',
        market,
        permissions: [],
      };
    }

    throw error;
  }

  if (!user) {
    return {
      status: 'unauthenticated',
      market,
      permissions: [],
    };
  }

  const infoResult = await withTimeout(
    ensurePosUmsInfo(user, authService.getConfigSnapshot()),
    POS_UMS_INFO_TIMEOUT_MS,
    'Timed out while loading POS UMS user info.'
  );

  if (!infoResult.ok) {
    throw new Error(`Failed to get UMS user info: ${infoResult.status}`);
  }

  return {
    status: 'ready',
    market,
    // 只保留当前市场的权限快照，避免把整份 UMS user info 带入业务态。
    permissions: normalizeCurrentMarketPermissions(infoResult.data, market),
    umsUserInfo: normalizePosUmsUserInfo(infoResult.data),
    loadedAt: Date.now(),
  };
}

export const syncPosUmsPermissions = createAsyncThunk(
  'user/syncPosUmsPermissions',
  async ({ locale }: SyncPosUmsPermissionsArgs, { dispatch, rejectWithValue }) => {
    const market = getPosUmsPermissionMarket(locale);
    // 显式 loading 状态用于页面级 guard：未完成拉取前不要误判为“无权限”。
    dispatch(setPosUmsPermissionLoading({ market }));

    try {
      const permissionState = await loadPosUmsPermissionSnapshot(locale);

      if (permissionState.status === 'unauthenticated') {
        dispatch(setPosUmsPermissionUnauthenticated({ market }));
        dispatch(resetPosUmsUserInfo());
        return permissionState;
      }

      if (permissionState.umsUserInfo) {
        dispatch(setPosUmsUserInfo(permissionState.umsUserInfo));
      }

      dispatch(
        setPosUmsPermissionReady({
          market,
          permissions: permissionState.permissions,
          loadedAt: permissionState.loadedAt || Date.now(),
        })
      );

      return permissionState;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync POS UMS permissions.';
      dispatch(
        setPosUmsPermissionError({
          market,
          error: message,
        })
      );
      return rejectWithValue(message);
    }
  }
);

export function clearPosUmsPermissionState() {
  return resetPosUmsPermission();
}
