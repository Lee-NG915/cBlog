import { EcEnv } from '@castlery/config';

export const isProd = !EcEnv.NEXT_PUBLIC_APPLICATION_TEST_TAG;
