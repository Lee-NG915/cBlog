'use client';

import type { PropsWithChildren, ReactNode } from 'react';
import type { PosUmsPermissionRequirement } from '@castlery/modules-user-domain';
import { useCanPosUmsAccess, usePosUmsPermissionEnabled } from './hooks';

type PosUmsCanProps = PropsWithChildren<{
  requirement: PosUmsPermissionRequirement;
  fallback?: ReactNode;
}>;

export function PosUmsCan({ children, requirement, fallback = null }: PosUmsCanProps) {
  const enabled = usePosUmsPermissionEnabled();
  const canAccess = useCanPosUmsAccess(requirement);

  if (!enabled) {
    return <>{children}</>;
  }

  if (!canAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
