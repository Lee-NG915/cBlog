import React from 'react';
import PropTypes from 'prop-types';
import { getPageByKey } from 'pages';
import UniversalLink from 'components/UniversalLink';
import { ListItem, Sheet } from '@mui/joy';

const QuickLink = ({ pageKey, name, simple, sx = [], href, children, ...rest }) => {
  if (href) {
    const link = (
      <UniversalLink sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]} to={href} {...rest}>
        {name}
      </UniversalLink>
    );

    return simple ? link : <ListItem sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}>{link}</ListItem>;
  }
  const page = getPageByKey(pageKey);
  if (page) {
    const link = (
      <UniversalLink to={page.url} sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]} {...rest}>
        {name || page.name}
      </UniversalLink>
    );
    return simple ? link : <ListItem sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]}>{link}</ListItem>;
  }
  return (
    <Sheet sx={[{}, ...(Array.isArray(sx) ? sx : [sx])]} {...rest}>
      {name}
    </Sheet>
  );
};

QuickLink.propTypes = {
  pageKey: PropTypes.string,
  name: PropTypes.string,
  simple: PropTypes.bool,
  sx: PropTypes.array,
  href: PropTypes.string,
  children: PropTypes.any,
};
QuickLink.defaultProps = {
  simple: false,
};
export default QuickLink;
