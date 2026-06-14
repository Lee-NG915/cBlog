import { EcEnv } from '@castlery/config';
import Script from 'next/script';

export const CookieYes = () => {
  if (EcEnv.NEXT_PUBLIC_COOKIEYES_CDN && EcEnv.NEXT_PUBLIC_COOKIEYES_ENABLED) {
    return <Script src={EcEnv.NEXT_PUBLIC_COOKIEYES_CDN} strategy="afterInteractive" type="text/javascript"></Script>;
  }
  return null;
};
