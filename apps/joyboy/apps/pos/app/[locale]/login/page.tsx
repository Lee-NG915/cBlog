'use client';
import * as React from 'react';
import { Box } from '@castlery/fortress';
import { SalesRepLoginForm, PosUmsSelectBranchContent } from '@castlery/modules-user-components';
import { useGetCurrentAdminQuery } from '@castlery/modules-user-domain';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useRouter } from 'next/navigation';
import { posRoutes } from '@castlery/config';
import { sharedFeatureService } from '@castlery/shared-services';

const enablePosUmsAuth = sharedFeatureService.enabledPosUmsAuth;

export default function PosLoginPage() {
  const router = useRouter();
  const persistenceHandles = makePersistenceHandles();
  const retailId = Number(persistenceHandles.retailId.getItem()) || 0;

  const { data } = useGetCurrentAdminQuery(undefined, {
    // 开启 POS UMS 登录的市场由 UMS 登录组件自行处理登录态，
    // 不走旧的 getCurrentAdmin 自动跳转分支。
    skip: enablePosUmsAuth || !persistenceHandles.isLoggedIn.hasItem(),
  });

  const handleAfterLogin = React.useCallback(
    async ({ callbackUrl }: { retailId: number; callbackUrl?: string }) => {
      if (callbackUrl) {
        await router.replace(callbackUrl);
      } else {
        await router.replace(posRoutes.products);
      }
      // 等待一段时间，确保页面已经跳转
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    [router]
  );

  React.useEffect(() => {
    // 保留旧登录页已有的自动进入逻辑；
    // 开启 POS UMS 登录的市场由 UMS 登录组件接管，这里不触发，避免跳过 branch 选择。
    if (!enablePosUmsAuth && data?.id) {
      handleAfterLogin({ retailId });
    }
  }, [data?.id, handleAfterLogin, retailId]);

  if (enablePosUmsAuth) {
    return <PosUmsSelectBranchContent onSuccess={handleAfterLogin} />;
  }

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: theme.palette.brand.sage[500],
      })}
    >
      <SalesRepLoginForm
        onSuccess={handleAfterLogin}
        defaultValues={{
          retailId,
        }}
      />
    </Box>
  );
}
