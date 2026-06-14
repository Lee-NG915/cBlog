'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PermissionLoading } from '@castlery/shared-components';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { normalizePosCallbackUrl } from '@castlery/shared-persistence-kit/lib/posAuthBridge';
import { sharedFeatureService } from '@castlery/shared-services';

type RetailContextGuardProps = React.PropsWithChildren<{
  locale: string;
}>;

function buildRetailSelectionLoginUrl(locale: string, callbackUrl?: string) {
  const searchParams = new URLSearchParams();

  if (sharedFeatureService.enabledPosUmsAuth) {
    searchParams.set('changeStore', '1');
  }

  if (callbackUrl) {
    searchParams.set('callbackUrl', callbackUrl);
  }

  const query = searchParams.toString();

  return query ? `/${locale}/login?${query}` : `/${locale}/login`;
}

export function RetailContextGuard({ locale, children }: RetailContextGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hasRetailContext, setHasRetailContext] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const persistenceHandles = makePersistenceHandles();
    const retailId = persistenceHandles.retailId.getItem();

    if (retailId) {
      setHasRetailContext(true);
      return;
    }

    setHasRetailContext(false);

    const callbackUrl = normalizePosCallbackUrl(
      locale,
      `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`
    );

    router.replace(buildRetailSelectionLoginUrl(locale, callbackUrl));
  }, [locale, pathname, router, searchParams]);

  // discover 依赖 retail context；在没有 retailId 时不要先渲染业务布局，
  // 否则产品/购物车接口会先发出缺少 X-Retail-Store-ID 的请求。
  if (!hasRetailContext) {
    return <PermissionLoading />;
  }

  return <>{children}</>;
}
