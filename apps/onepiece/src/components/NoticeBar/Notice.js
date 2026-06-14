import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Countdown from 'components/Countdown';
import style from './style.scss';

const Text = ({ notice, className = '' }) => (
  <div className={`${style.notice}__container ${className}`}>
    <div
      className={`${style.notice}__text`}
      dangerouslySetInnerHTML={{
        __html: notice.title,
      }}
    />
    {notice.countdown_enabled && (
      <Countdown collapsed className={`${style.notice}__countdown`} deadline={notice.ended_at} />
    )}
  </div>
);

Text.propTypes = {
  notice: PropTypes.object,
  className: PropTypes.string,
};

const Notice = ({ notice, handlePopup, handlePermalink, className = '' }) => {
  const handlePopupClick = useCallback(() => {
    handlePopup(notice);
  }, [notice, handlePopup]);

  const handlePermalinkClick = useCallback(() => {
    handlePermalink(notice);
  }, [notice, handlePermalink]);

  if (!notice) {
    return null;
  }
  let block;
  if (notice.permalink) {
    block = (
      <div role="button" data-notice="permalink" data-uid={notice._uid} className={className}>
        <Text notice={notice} />
      </div>
    );
  } else if (notice.image_url) {
    block = (
      <div role="button" data-notice="image_url" data-uid={notice._uid} className={className}>
        <Text notice={notice} />
      </div>
    );
  } else if (notice.link) {
    const linkStr = notice.link.startsWith('/') ? notice.link : `/${notice.link}`;
    block = (
      <Link
        href={`${__BASE_URL__}${linkStr}`}
        data-notice="link"
        data-uid={notice._uid}
        className={`${className}`}
        style={{ display: 'block' }}
      >
        <Text notice={notice} />
      </Link>
    );
  } else {
    block = <Text notice={notice} className={className} />;
  }
  return block;
};

export default Notice;
