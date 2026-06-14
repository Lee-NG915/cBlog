import { Link, SxProps } from '@castlery/fortress';
import { CustomLink } from '@castlery/shared-components';
import React, { ComponentClass, FunctionComponent, forwardRef } from 'react';

type LinkButtonProps = {
  path?: string;
  children?: string | ComponentClass<any, any> | FunctionComponent<any> | Element | any;
  menuType: string;
  text: string;
  to?: string;
  isOriginal?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  target?: string;
  sx?: SxProps;
};

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ path, children, menuType, target, text, sx, ...otherProps }, ref) => {
    return (
      <Link
        component={CustomLink}
        role="button"
        href={path}
        data-action={menuType}
        target={target || '_self'}
        data-label={text}
        aria-label={text}
        ref={ref}
        prefetch={false}
        {...otherProps}
        sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {children}
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export default LinkButton;
