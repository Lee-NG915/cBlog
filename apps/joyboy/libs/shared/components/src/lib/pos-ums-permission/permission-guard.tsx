'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import type { PosUmsPermissionRequirement } from '@castlery/modules-user-domain';
import { useCanPosUmsAccess, usePosUmsPermissionEnabled, usePosUmsPermissionState } from './hooks';

type PosUmsPermissionGuardProps = PropsWithChildren<{
  requirement: PosUmsPermissionRequirement;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}>;

export function PosUmsPermissionGuard({
  children,
  requirement,
  fallback = null,
  loadingFallback = null,
}: PosUmsPermissionGuardProps) {
  const enabled = usePosUmsPermissionEnabled();
  const permissionState = usePosUmsPermissionState();
  const canAccess = useCanPosUmsAccess(requirement);

  if (!enabled) {
    return <>{children}</>;
  }

  if (permissionState.status === 'idle' || permissionState.status === 'loading') {
    return <>{loadingFallback}</>;
  }

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
