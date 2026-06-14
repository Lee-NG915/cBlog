'use client';

import { setTermsOfUse } from '@castlery/modules-cms-domain';
import { useAppSelector, useAppStore } from '@castlery/shared-redux-store';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTermsVersion } from '@castlery/shared-components';
import { useEffect, useRef } from 'react';
import { basePageConfig, enableAlert } from '@castlery/config';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { signOut } from '@castlery/modules-user-services';
import { TermsWithVersionStoryblok } from '@castlery/types';

interface TermsOfUseGlobalClientProps {
  termsOfUse: TermsWithVersionStoryblok[];
}

export const TermsOfUseGlobalClient = (props: TermsOfUseGlobalClientProps) => {
  const { termsOfUse } = props;
  const pathname = usePathname();
  const customer = useAppSelector(selectedActiveUser);
  const store = useAppStore();
  const initialized = useRef(false);
  const termsChecked = useRef(false);
  const router = useRouter();
  const params = useParams();
  const region = params.region as string;
  const { checkTermsVersion } = useTermsVersion(termsOfUse?.[0]);

  if (!initialized.current) {
    store.dispatch(setTermsOfUse(termsOfUse));
    initialized.current = true;
  }

  useEffect(() => {
    if (termsChecked.current) {
      return;
    }

    const whiteList = ['/checkout', '/terms-of-use'];
    const isWhiteListPage = whiteList.some((item) => pathname?.includes(item));
    if (customer && termsOfUse && enableAlert && !isWhiteListPage) {
      termsChecked.current = true;
      checkTermsVersion({
        isNeedAlert: enableAlert,
        onConfirm: () => {},
        onCancel: async () => {
          await store.dispatch(signOut({ reload: false })).unwrap();
          router.replace(`${region}${basePageConfig.login}` as any);
        },
        onClose: async () => {
          await store.dispatch(signOut({ reload: false })).unwrap();
          router.replace(`${region}${basePageConfig.login}` as any);
        },
      });
    }
  }, [termsOfUse]);

  return null;
};
