'use client';

import NextLink from 'next/link';
import type { Route } from 'next';

// import { useParams } from 'next/navigation';
import React from 'react';
import { EcEnv } from '@castlery/config';
import { Link, LinkProps } from '@castlery/fortress';

/**
 * Use this component to create a Next.js `<Link />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 */
export const LocalizedClientLink = <T extends string>({
  children,
  href,
  joyboyProps,
  ...props
}: {
  children?: React.ReactNode;
  href: Route<T> | URL;
  className?: string;
  onClick?: () => void;
  passHref?: true;
  joyboyProps?: LinkProps;
  [x: string]: any;
}) => {
  // const { countryCode } = useParams();
  const countryCode = EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase();
  return (
    // @abbywang23 这里会不会影响到 i18n 的路由设计
    <NextLink href={`/${countryCode}${href}`} passHref {...props}>
      <Link {...joyboyProps}>{children}</Link>
      {children}
    </NextLink>
  );
};
