'use client';

import { Fragment, forwardRef } from 'react';
import ReactDOM from 'react-dom';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>((props, ref) => {
  const { href, children, onClick, ...restProps } = props;

  const handleLinkClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(event);
    }

    event.preventDefault(); // 阻止默认的链接行为
    window.location.href = href;
  };

  const ExternalPrefetchTag = () => {
    if (ReactDOM?.prefetchDNS) {
      ReactDOM.prefetchDNS(href);
    }
    return '';
  };

  return (
    <Fragment>
      <ExternalPrefetchTag />
      <a href={href} onClick={handleLinkClick} ref={ref} {...restProps}>
        {children}
      </a>
    </Fragment>
  );
});

export default ExternalLink;
