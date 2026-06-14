import Script from 'next/script';
import React from 'react';
import { isProd } from '@castlery/modules-cms-services';

const StoryblokEditableSupport = () => {
  if (isProd) {
    return null;
  }

  return <Script strategy="beforeInteractive" src="//app.storyblok.com/f/storyblok-v2-latest.js" async />;
};

export { StoryblokEditableSupport };
