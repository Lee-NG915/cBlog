import React from 'react';
import { Link } from '@castlery/fortress';
import { getUrl } from 'pages';

interface ButtonLinkProps {
  path?: string;
  handler?: () => void;
  children: React.ReactNode;
  restProps?: Record<string, any>;
}

export const ButtonLink: React.FC<ButtonLinkProps> = ({ path, children, handler, restProps }) => {
  const open = React.useCallback(
    (event) => {
      event?.preventDefault();
      if (handler && typeof handler === 'function') {
        handler();
        return;
      }
      if (getUrl(path)) {
        const prefix = __COUNTRY__.toLowerCase();
        window?.open(`/${prefix}${getUrl(path)}`, '_blank');
      }
    },
    [path, handler]
  );

  return (
    <Link
      underline="always"
      onClick={open}
      color="var(--fortress-palette-brand-charcoal-500)"
      sx={{
        '&.MuiLink-underlineHover': {
          color: 'var(--fortress-palette-brand-terracotta-400)',
        },
      }}
      slotProps={{
        root: {
          sx: {
            ...(restProps?.sx || {}),
            '&:hover,&:focus': {
              color: 'var(--fortress-palette-brand-terracotta-400)',
              textDecoration: 'underline',
            },
          },
        },
      }}
      {...restProps}
    >
      {children}
    </Link>
  );
};
