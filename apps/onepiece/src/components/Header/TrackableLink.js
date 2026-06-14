import React, { useCallback } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { EVENT_LINK_CLICK } from 'utils/track/constants';
import classNames from 'classnames';
import { shouldUseInternalRoute, getExternalUrl } from 'utils/brandRefeshLinkJump';
import style from './style.scss';

const TrackableLink = ({ path, menuType, text, children, isOriginal, onClick, className, target, ...otherProps }) => {
  const dispatch = useDispatch();

  const useInternalRoute = shouldUseInternalRoute(path);
  const finalPath = useInternalRoute ? path : getExternalUrl(path);

  const handleLinkClick = useCallback(
    (e) => {
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
    },
    [dispatch, onClick]
  );

  return useInternalRoute ? (
    <Link
      className={classNames(style.trackableLink, className, {
        'no-path': !path,
      })}
      to={finalPath}
      onClick={handleLinkClick}
      data-category="link_click"
      data-action={menuType}
      data-label={text}
      {...otherProps}
    >
      {children || text}
    </Link>
  ) : (
    <a
      className={classNames(style.trackableLink, className, {
        'no-path': !path,
      })}
      href={finalPath}
      role="button"
      onClick={handleLinkClick}
      target={target || '_self'}
      data-category="link_click"
      data-action={menuType}
      data-label={text}
    >
      {children || text}
    </a>
  );
};
TrackableLink.propTypes = {
  path: PropTypes.string,
  menuType: PropTypes.string.isRequired,
  text: PropTypes.string,
  children: PropTypes.node,
  isOriginal: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  target: PropTypes.string,
};

export default TrackableLink;
