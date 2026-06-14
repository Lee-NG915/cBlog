import React from 'react';
import PropTypes from 'prop-types';
import { RouterLink } from 'components/RouterLink';
// TODO 这个后续考虑一下 感觉完全没必要存在 RouterLink 就可以处理内部链接和外部链接了
const UniversalLink = ({ to, children, sx, ...rest }) => {
  let target = '';
  if (typeof to === 'string') {
    target = to;
  } else if (to instanceof Object && 'pathname' in to) {
    target = to.pathname;
  }
  if (target.startsWith('https://') || target.startsWith('http://')) {
    return (
      // <a href={target} {...rest}>
      //   {children}
      // </a>
      <RouterLink href={target} {...rest} sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}>
        {children}
      </RouterLink>
    );
  }
  return (
    <RouterLink to={to} {...rest} sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </RouterLink>
  );
};
UniversalLink.propTypes = {
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sx: PropTypes.array,
  children: PropTypes.node,
};
export default UniversalLink;
