import React from 'react';
import PropTypes from 'prop-types';

export function withSourceCheck(Component) {
  function WrappedComponent(props) {
    const { location } = props;
    const { query } = location || {};
    const isOffline = query?.utm_medium === 'offline';
    return isOffline ? <Component {...props} /> : <></>;
  }
  WrappedComponent.propTypes = {
    ...Component.propTypes,
    location: PropTypes.object,
  };
  return WrappedComponent;
}
