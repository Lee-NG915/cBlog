'use client';
import ReactDOM from 'react-dom';
import { EcEnv } from '@castlery/config';

const publicCDNMap = () => {
  switch (EcEnv.NEXT_PUBLIC_APPLICATION_ENV) {
    case 'sg-prod':
      return '//static.castlery.sg';
    case 'us-prod':
      return '//static-prod.castlery.co';
    case 'au-prod':
      return '//static.castlery.com.au';
    case 'ca-prod':
      return '//static-ca-prod.castlery.com';
    case 'uk-prod':
      return '//static-uk-prod.castlery.com';
    case 'sg-uat':
      return '//static-uat.castlery.sg';
    case 'us-uat':
      return '//static-uat.castlery.co';
    case 'au-uat':
      return '//static-uat.castlery.com.au';
    case 'ca-uat':
      return '//static-ca-uat.castlery.com';
    case 'uk-uat':
      return '//static-uk-uat.castlery.com';
    case 'sg-test':
      return '//static-test.castlery.sg';
    case 'us-test':
      return '//static-test.castlery.co';
    case 'au-test':
      return '//static-test.castlery.com.au';
    case 'ca-test':
      return '//static-ca-test.castlery.com';
    case 'uk-test':
      return '//static-uk-test.castlery.com';
    default:
      return '//static-prod.castlery.co';
  }
};

export const PublicCDNPreloadResources = () => {
  const cdnHost = publicCDNMap();
  ReactDOM.preconnect(cdnHost);
  ReactDOM.prefetchDNS(cdnHost);
  return null;
};
