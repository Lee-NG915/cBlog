'use client';

import { createUrl } from '@castlery/utils';
import { usePathname, useSearchParams } from 'next/navigation';
// import React from 'react';

export default function HelpCenterPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const newSearchparams = new URLSearchParams(searchParams?.toString());
  const url = createUrl(pathname || '', newSearchparams);
  if (typeof window !== 'undefined') {
    window.location.href = `https://www.castlery.com${url}`;
  }
  return null;
}
