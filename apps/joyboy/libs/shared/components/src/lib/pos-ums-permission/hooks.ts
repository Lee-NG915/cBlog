'use client';

import * as React from 'react';
import { selectedPosUmsPermissionState, type PosUmsPermissionRequirement } from '@castlery/modules-user-domain';
import { canPosUmsAccess, hasPosUmsPermission } from '@castlery/modules-user-services';
import { sharedFeatureService } from '@castlery/shared-services';
import { useAppSelector } from '@castlery/shared-redux-store';

const enablePosUmsAuth = sharedFeatureService.enabledPosUmsAuth;

export function usePosUmsPermissionState() {
  return useAppSelector(selectedPosUmsPermissionState);
}

export function usePosUmsPermissionEnabled(): boolean {
  return enablePosUmsAuth;
}

/**
 * 判断当前市场权限快照中，是否包含某一个精确权限点。
 *
 * 适用场景：
 * - 单个按钮是否可点击
 * - 某个操作入口是否显示
 * - 某个字段是否允许编辑
 *
 * 这个 hook 只处理“一条权限字符串”的判断，不负责 `anyOf` / `allOf`
 * 这类组合权限表达式。若业务规则是“满足任一权限”或“必须同时满足多条权限”，
 * 应使用 `useCanPosUmsAccess`。
 *
 * 如果当前市场未开启 POS UMS 登录，则默认返回 `true`，表示业务沿用原有非 UMS 鉴权路径。
 */
export function useHasPosUmsPermission(permission: string): boolean {
  const permissionState = usePosUmsPermissionState();
  const enabled = usePosUmsPermissionEnabled();

  return React.useMemo(() => {
    if (!enabled) {
      return true;
    }

    return hasPosUmsPermission(permissionState, permission);
  }, [enabled, permission, permissionState]);
}

/**
 * 判断当前市场权限快照是否满足一个完整的权限要求表达式。
 *
 * 支持的 requirement 形态：
 * - `'permission:key'`
 * - `{ anyOf: ['permission:a', 'permission:b'] }`
 * - `{ allOf: ['permission:a', 'permission:b'] }`
 *
 * 适用场景：
 * - 页面访问权限
 * - Tab / 区块级展示权限
 * - 需要“任一满足”或“全部满足”的组合判断
 *
 * 如果业务只需要判断“是否拥有某一个精确权限点”，优先使用
 * `useHasPosUmsPermission`，语义会更直接。
 *
 * 如果当前市场未开启 POS UMS 登录，则默认返回 `true`，表示当前市场不启用这套权限门禁。
 */
export function useCanPosUmsAccess(requirement: PosUmsPermissionRequirement): boolean {
  const permissionState = usePosUmsPermissionState();
  const enabled = usePosUmsPermissionEnabled();

  return React.useMemo(() => {
    if (!enabled) {
      return true;
    }

    // 给业务组件一个纯布尔结果，方便“隐藏”与“禁用但展示”两种 UI 策略共用。
    return canPosUmsAccess(permissionState, requirement);
  }, [enabled, permissionState, requirement]);
}
