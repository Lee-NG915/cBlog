import React, { ComponentClass, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { EVENT_LINK_CLICK } from 'utils/track/constants';
import { SxProps, Link } from '@castlery/fortress';
import { CountrySelector } from 'components/CountrySelector';
import { RouterLink } from 'components/RouterLink';
import { shouldUseInternalRoute, getExternalUrl } from 'utils/brandRefeshLinkJump';
import { GlobalNavUI } from './components';

// TODO 这里没必要  通过 isOriginal 来区分
// TODO 后续思考下 能不能不要复用这个组件
// TODO 或者 直接封装到 ReactLink里面 ？
// TODO 那还不如使用路由钩子来上报？是因为拿到点击元素里的数据吗？
export type TrackableLinkProps = {
  path?: string;
  menuType: string;
  text: string;
  children?: string | ComponentClass<any, any> | FunctionComponent<any> | Element | any;
  to?: string;
  isOriginal?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  target?: string;
  sx?: SxProps;
  component?: React.FunctionComponent;
};

// TODO 如果要使用 component 的替换方式 要怎么处理
// TODO 是不是有潜在的 ref 问题
export const TrackableLink = ({
  path,
  menuType,
  text,
  children,
  isOriginal,
  onClick,
  target,
  sx = [],
  ...otherProps
}: TrackableLinkProps) => {
  const dispatch = useDispatch();

  // 使用统一的链接判断逻辑，优先使用 path，如果没有则保持原有的 isOriginal 逻辑
  const useInternalRoute = path ? shouldUseInternalRoute(path) : !isOriginal;
  const finalPath = path && !useInternalRoute ? getExternalUrl(path) : path;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!e) return;
    const {
      href,
      dataset: { category, action, label },
    } = e.currentTarget;

    dispatch({
      type: EVENT_LINK_CLICK,
      result: {
        category,
        action,
        label,
        link: href,
      },
    });

    if (onClick) {
      onClick(e);
    }
  };

  // 根据链接类型决定渲染方式
  const shouldUseExternalLink = !useInternalRoute;

  return shouldUseExternalLink ? (
    <Link
      component="a"
      href={finalPath}
      role="button"
      onClick={handleLinkClick}
      target={target || '_self'}
      data-category="link_click"
      data-action={menuType}
      data-label={text}
      {...otherProps}
      sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children || text}
    </Link>
  ) : (
    <RouterLink
      sx={sx}
      onClick={handleLinkClick}
      data-category="link_click"
      data-action={menuType}
      data-label={text}
      {...otherProps}
      to={finalPath}
    >
      {children || text}
    </RouterLink>
  );
};

export type LinkType = {
  path: string;
  menuType: string;
  text: string;
  target?: string;
};

type CommonLinkProps = {
  linkProps: LinkType;
  children?: string | ComponentClass<any, any> | FunctionComponent<any> | Element | any;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  sx?: SxProps;
};

// 已废弃：使用 shouldUseInternalRoute 替代
// 保留此函数是为了向后兼容，但建议使用新的工具库函数
export const isOriginalLink = (url: string) => !shouldUseInternalRoute(url);

// 使用统一的链接处理逻辑，自动判断内部/外部链接
export const CommonLink = ({ linkProps, children, onClick, sx, ...otherProps }: CommonLinkProps) => {
  const { path, menuType, text, target } = linkProps;
  const dispatch = useDispatch();

  // 使用统一的工具库进行链接判断和处理
  const useInternalRoute = shouldUseInternalRoute(path);
  const finalPath = useInternalRoute ? path : getExternalUrl(path);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!e) return;
    const {
      href,
      dataset: { category, action, label },
    } = e.currentTarget;

    dispatch({
      type: EVENT_LINK_CLICK,
      result: {
        category,
        action,
        label,
        link: href,
      },
    });

    if (onClick) {
      onClick(e);
    }
  };

  // 外部链接使用 <a> 标签，内部链接使用 RouterLink
  if (!useInternalRoute) {
    return (
      <Link
        component="a"
        href={finalPath}
        role="button"
        onClick={handleLinkClick}
        target={target || '_self'}
        data-category="link_click"
        data-action={menuType}
        data-label={text}
        {...otherProps}
        sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {children || text}
      </Link>
    );
  }

  return (
    <RouterLink
      sx={sx}
      onClick={handleLinkClick}
      data-category="link_click"
      data-action={menuType}
      data-label={text}
      {...otherProps}
      to={finalPath}
    >
      {children || text}
    </RouterLink>
  );
};

export default function () {
  return (
    <GlobalNavUI>
      {Array.isArray((global as unknown as { __globalNav: { linkProps?: LinkType; link: LinkType }[] }).__globalNav) &&
        (global as unknown as { __globalNav: { linkProps?: LinkType; link: LinkType }[] }).__globalNav.map(
          (item: { linkProps?: LinkType; link: LinkType }, index: number) => {
            if (!item) return;
            return <CommonLink key={index} linkProps={item.linkProps ?? item.link} />;
          }
        )}
      <CountrySelector size="sm" showIcon={false} />
    </GlobalNavUI>
  );
}
