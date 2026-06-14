import type {
  PosUmsMarketCode,
  PosUmsPermissionRequirement,
  PosUmsPermissionState,
} from '@castlery/modules-user-domain';
import { isPosUmsMarketCode } from '@castlery/modules-user-domain';

type PosUmsInfoPayload = {
  data?: {
    country_codes_permissions?: Record<string, unknown>;
  };
};

function filterPermissionList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return [
    ...new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)),
  ].sort();
}

function normalizePermissionRequirement(requirement: PosUmsPermissionRequirement): PosUmsPermissionRequirement {
  // `in` 右侧不能是 null/undefined，调用方若传入 undefined（例如可选 props 未传）会直接抛错
  if (requirement == null) {
    return { allOf: [] };
  }

  if (typeof requirement === 'string') {
    return requirement.trim();
  }

  if (typeof requirement !== 'object') {
    return { allOf: [] };
  }

  if ('anyOf' in requirement) {
    return {
      anyOf: filterPermissionList(requirement.anyOf),
    };
  }

  if ('allOf' in requirement) {
    return {
      allOf: filterPermissionList(requirement.allOf),
    };
  }

  return { allOf: [] };
}

export function getPosUmsPermissionMarket(market: string): PosUmsMarketCode {
  const normalizedMarket = market.trim().toUpperCase();

  if (!isPosUmsMarketCode(normalizedMarket)) {
    throw new Error(`Unsupported POS UMS permission market: ${market}`);
  }

  return normalizedMarket;
}

export function normalizeCurrentMarketPermissions(info: unknown, market: PosUmsMarketCode): string[] {
  const permissionsByCountry = (info as PosUmsInfoPayload | null)?.data?.country_codes_permissions;
  // 权限系统只消费当前市场下的权限集合，不合并顶层 permissions / roles 等其他字段。
  return filterPermissionList(permissionsByCountry?.[market]);
}

export function hasPosUmsPermission(
  permissionState: Pick<PosUmsPermissionState, 'status' | 'permissions'>,
  permission: string
): boolean {
  if (permissionState.status !== 'ready') {
    return false;
  }

  const normalizedPermission = permission.trim();

  if (!normalizedPermission) {
    return false;
  }

  return permissionState.permissions.includes(normalizedPermission);
}

export function canPosUmsAccess(
  permissionState: Pick<PosUmsPermissionState, 'status' | 'permissions'>,
  requirement: PosUmsPermissionRequirement
): boolean {
  // 统一把 string / anyOf / allOf 转成稳定结构，业务组件只关心布尔结果即可。
  const normalizedRequirement = normalizePermissionRequirement(requirement);

  if (typeof normalizedRequirement === 'string') {
    return hasPosUmsPermission(permissionState, normalizedRequirement);
  }

  if ('anyOf' in normalizedRequirement) {
    if (normalizedRequirement.anyOf.length === 0) {
      return false;
    }

    return normalizedRequirement.anyOf.some((permission) => hasPosUmsPermission(permissionState, permission));
  }

  if (normalizedRequirement.allOf.length === 0) {
    return false;
  }

  return normalizedRequirement.allOf.every((permission) => hasPosUmsPermission(permissionState, permission));
}
