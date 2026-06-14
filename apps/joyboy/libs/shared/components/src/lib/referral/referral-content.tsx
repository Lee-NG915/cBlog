'use client';
// import { useEffect } from 'react';
// import { useSearchParams } from 'next/navigation';
// import { useNiceModal } from '@castlery/fortress/NiceModal';
import { EcEnv } from '@castlery/config';

export function ReferralContent() {
  // const searchParams = useSearchParams();
  // const [modal] = useNiceModal();

  // useEffect(() => {
  //   const openParam = searchParams?.get('open');
  //   if (openParam === 'cart') {
  //     modal.info({
  //       title: 'Cart',
  //       desc: 'Loading cart...',
  //       showCancelBtn: false,
  //       confirmText: 'OK',
  //     });

  //     // Clean up URL by removing query parameters
  //     const currentURL = window.location.href;
  //     const newURL = currentURL.substring(0, currentURL.indexOf('?'));
  //     window.history.pushState({ path: newURL }, '', newURL);
  //   }
  // }, [searchParams, modal]);

  // 不清楚旧代码这里的逻辑，什么作用，暂时注释掉
  // if (EcEnv.NEXT_PUBLIC_FRIENDBUY_ENABLED) {
  //   return <div id="friendbuylanding" />;
  // }

  // Yotpo integration
  if (EcEnv.NEXT_PUBLIC_YOTPO_ENABLED) {
    return <div className="yotpo-widget-instance" data-yotpo-instance-id={EcEnv.NEXT_PUBLIC_YOTPO_REFERRAL_ID} />;
  }

  return null;
}
