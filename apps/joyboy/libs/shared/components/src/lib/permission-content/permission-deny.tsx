'use client';

import { Box, Typography, Stack } from '@castlery/fortress';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { useHasPosUmsPermission } from '@castlery/shared-components';
import { posRoutes } from '@castlery/config';
import { useEffect } from 'react';

export function PermissionDeny() {
  const allPagesPermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posPagesRead);

  useEffect(() => {
    if (!allPagesPermission) {
      window.location.replace(posRoutes.login);
    }
  }, [allPagesPermission]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
      <Stack gap={8} alignItems="center">
        <Typography level="h2" textAlign="center">
          You are not authorized to access this page.
        </Typography>
      </Stack>
    </Box>
  );
}
