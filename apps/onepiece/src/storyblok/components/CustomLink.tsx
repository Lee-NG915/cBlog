import React from 'react';
import { Stack } from '@castlery/fortress';
import { Link } from 'react-router';
import { SxProps } from '@mui/joy/styles/types';

export type CustomLinkProps = {
  link?: {
    url?: string;
    target?: string;
  };
  children?: React.ReactNode;
  sx?: SxProps;
  handleClick?: () => void;
};

function CustomLink({ link, children, sx = [], handleClick }: CustomLinkProps) {
  const { url, target } = link || {};
  const isExternalLink = url?.startsWith('https://') || url?.startsWith('http://');

  return url ? (
    <Stack onClick={handleClick} sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      {isExternalLink ? (
        <a href={url} target={target}>
          {children}
        </a>
      ) : (
        <Link to={url} target={target}>
          {children}
        </Link>
      )}
    </Stack>
  ) : (
    children
  );
}

export { CustomLink };
