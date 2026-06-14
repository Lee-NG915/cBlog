import React from 'react';
import PropTypes from 'prop-types';
import { Link, LinkProps } from '@castlery/fortress';
import { routerShape, InjectedRouter } from 'react-router';

function isLeftClickEvent(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  return event.button === 0;
}

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function resolveToLocation(to: RouterLinkProps['to'], router: RouterProps) {
  return typeof to === 'function' ? to(router.location) : to;
}

// : (props: LinkProps, context: { router: PlainRoute }) => void

export interface RouterLinkProps extends LinkProps {
  to?: string | ((location: Location) => string);
}

export type RouterProps = {
  location: Location;
} & InjectedRouter;

/**
 * TODO 这里有个问题 就是 我现在还不知道怎么通过  useContext 来获取 router
 * 就会导致 我现在这种写法 无法使用 React.forwardRef 来获取到 Ref
 */
export const RouterLink = (
  {
    to,
    onClick,
    // TODO target 这里还没思考好
    target,
    ...props
  }: RouterLinkProps,
  // TODO 这里用InjectedRouter 是不对的 因为少了一个 location
  { router }: { router?: RouterProps }
) => {
  if (!router) {
    console.error("==============>'no router'");
    console.error('no router');
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (onClick) {
      onClick(event);
    }

    if (event.defaultPrevented) return;

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) return;

    // If target prop is set (e.g. to "_blank"), let browser handle link.
    /* istanbul ignore if: untestable with Karma */
    if (target) return;

    event.preventDefault();
    // TODO 类型没写好 应该换 to 和 target 做到互斥  并保证一定要传其中一个
    router?.push(resolveToLocation(to, router));
  };

  if (router) {
    if (!to) {
      return <Link {...props} onClick={handleClick} />;
    }
    const toLocation = resolveToLocation(to, router);
    try {
      // Remove '/' at the end of string
      const href = (router?.createHref(toLocation) || '').replace(/\/$/, '');
      props.href = href;
    } catch (error) {
      console.log('==============>error');
      console.log(error);
    }
  }

  return <Link component="a" {...props} onClick={handleClick} />;
};
RouterLink.contextTypes = {
  router: PropTypes.object,
};
