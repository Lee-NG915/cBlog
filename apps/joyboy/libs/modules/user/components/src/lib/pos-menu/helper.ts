import { EcEnv } from '@castlery/config';

export const cowboyLeadHelperLink = EcEnv.NEXT_PUBLIC_APPLICATION_TEST_TAG
  ? 'https://cowboy-test.castlery.com/lms/lead?current=1&pageSize=20'
  : 'https://cowboy.castlery.com/lms/lead?current=1&pageSize=20';
