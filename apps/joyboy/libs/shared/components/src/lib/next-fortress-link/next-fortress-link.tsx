'use client';
import React from 'react';
import { Link, LinkProps as MuiLinkProps } from '@castlery/fortress';
import { CustomLink, CustomLinkProps } from '../custom-link/custom-link';

/**
 * NextFortressLink 组件与 Link 组件区分开，因为有涉及到 Next link 部分，不能被非 NextJS 项目使用
 *
 */
export interface NextFortressLinkProps extends MuiLinkProps, Omit<CustomLinkProps, keyof MuiLinkProps> {}

export const NextFortressLink = React.forwardRef<HTMLAnchorElement, NextFortressLinkProps>((props, ref) => {
  const { component = CustomLink, children, ...muiLinkProps } = props;

  return (
    <Link component={component} ref={ref} {...muiLinkProps}>
      {children}
    </Link>
  );
});
