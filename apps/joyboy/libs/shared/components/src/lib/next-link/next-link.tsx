import * as React from 'react';
import { Link } from '@castlery/fortress';
import NLink, { LinkProps } from 'next/link';

type NextLinkProps = LinkProps & {
  children: React.ReactNode;
};

export const NextLink: React.FC<NextLinkProps> = ({ children, ...props }) => {
  return (
    <NLink {...props}>
      <Link>{children}</Link>
    </NLink>
  );
};
