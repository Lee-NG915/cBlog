'use client';

import { EcEnv, basePageConfig, supportRegions } from '@castlery/config';
import Link, { LinkProps } from 'next/link';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Url } from 'url';
import ExternalLink from './external-link/external-link';

export interface CustomLinkProps extends Omit<LinkProps, 'href'> {
  href?: Url | string;
  linkKey?: string;
  isExternalFlag?: boolean;
  children?: React.ReactNode;
}

export const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>((props: CustomLinkProps, ref) => {
  const { href, linkKey, isExternalFlag, children, prefetch, ...restProps } = props;
  const [finalHref, setFinalHref] = useState(href);

  const extraTag = useMemo(() => {
    if (EcEnv.NEXT_PUBLIC_APPLICATION_ENV.indexOf('test') > -1) {
      return '-test';
    } else if (EcEnv.NEXT_PUBLIC_APPLICATION_ENV.indexOf('uat') > -1) {
      return '-uat';
    } else {
      return '';
    }
  }, []);

  const keyPath = useMemo(() => {
    if (linkKey?.startsWith('https://')) {
      if (linkKey.indexOf('www.castlery.com') > -1) {
        return linkKey.replace('www.castlery.com', `www${extraTag}.castlery.com`);
      }
      return linkKey;
    }
    if (linkKey) {
      const path = basePageConfig?.[linkKey as keyof typeof basePageConfig]
        ? (basePageConfig[linkKey as keyof typeof basePageConfig] as string)
        : `${linkKey}`;

      return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${
        typeof path === 'string' && path.startsWith('/') ? path : `/${path}`
      }`;
    }
  }, [linkKey, extraTag]);

  useEffect(() => {
    if (href) {
      setFinalHref(href);
    } else if (linkKey && !keyPath) {
      setFinalHref(`/${linkKey}`);
    }
  }, [href, linkKey, keyPath]);

  const urlParam = useMemo(() => (typeof finalHref === 'string' ? finalHref : finalHref?.href ?? ''), [finalHref]);

  const getAbsoluteUrl = useCallback((url: string): string => {
    const targetCountry = EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase();
    const regex = new RegExp(`/(?:${supportRegions.join('|')})(/|$)`, 'gi');
    let updatedUrl = '';
    if (regex.test(url)) {
      // 匹配到则替换
      return (updatedUrl = url.replace(regex, `/${targetCountry}$1`));
    } else {
      // 没有匹配到则追加当前国家代码
      // TODO @jasper 后续改进，这里不要拼写绝对值
      try {
        const urlObj = new URL(url, `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}`);
        updatedUrl = `${urlObj.origin}/${targetCountry}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
        return updatedUrl;
      } catch (e) {
        return url;
      }
    }
  }, []);

  const absoluteHref = useMemo(() => getAbsoluteUrl(urlParam), [urlParam, getAbsoluteUrl]);

  const externalFilter = useCallback((targetUrl: string) => {
    try {
      const url = new URL(targetUrl, `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST}`).href;
      return url;
    } catch {
      return targetUrl;
    }
  }, []);

  if (!linkKey && !finalHref)
    return (
      <a href="/" ref={ref} {...restProps}>
        {children}
      </a>
    );

  if (linkKey && keyPath) {
    if (isExternalFlag) {
      return (
        <ExternalLink href={externalFilter(keyPath)} ref={ref} {...restProps}>
          {children}
        </ExternalLink>
      );
    } else {
      return (
        <Link href={keyPath} prefetch={prefetch ?? false} ref={ref} {...restProps}>
          {children}
        </Link>
      );
    }
  }

  if (isExternalFlag) {
    return (
      <ExternalLink href={externalFilter(absoluteHref)} ref={ref} {...restProps}>
        {children}
      </ExternalLink>
    );
  } else {
    return (
      <Link href={finalHref!} prefetch={prefetch ?? false} ref={ref} {...restProps}>
        {children}
      </Link>
    );
  }
});

export default CustomLink;
