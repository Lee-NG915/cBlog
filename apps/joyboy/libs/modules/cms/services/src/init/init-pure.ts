import { EcEnv } from '@castlery/config';
import { storyblokInit, apiPlugin } from '@storyblok/react';

const initPure = () => {
  storyblokInit({
    accessToken: EcEnv.NEXT_PUBLIC_STORYBLOK_TOKEN,
    use: [apiPlugin],
  });
};

export { initPure };
