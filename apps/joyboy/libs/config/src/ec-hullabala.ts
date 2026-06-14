import { EcEnv } from './ec-env';

export const HULLA_EXPERIENCE_LABEL = {
  SG: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'castlery-stickers-sg-test_2025brand'
    : 'castlery-stickers-sg-prod_2025brand',
  AU: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'castlery-stickers-au-test_2025brand'
    : 'castlery-stickers-au-prod_2025brand',
  US: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'castlery-stickers-us-test_2025brand'
    : 'castlery-stickers-us-prod_2025brand',
  CA: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'castlery-stickers-feed-ca-test_2025brand'
    : 'castlery-stickers-feed-ca-prod_2025brand',
  UK: EcEnv.NEXT_PUBLIC_APPLICATION_ENV.includes('test')
    ? 'castlery-stickers-feed-uk-test_2025brand'
    : 'castlery-stickers-feed-uk-prod_2025brand',
};
