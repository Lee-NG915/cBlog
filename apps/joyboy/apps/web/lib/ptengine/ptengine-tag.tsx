'use client';
import React from 'react';
import Script from 'next/script';
import { EcEnv } from '@castlery/config';

//   <script src="https://js.ptengine.com/7f1bbmj9.js"></script>

export const PtengineTag = () => {
  return (
    <Script
      type="text/javascript"
      strategy="afterInteractive"
      src={`https://js.ptengine.com/${EcEnv.NEXT_PUBLIC_PTENGINE_ID}.js`}
    ></Script>
  );
};
