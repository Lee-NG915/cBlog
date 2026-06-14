import React from 'react';
import ReactPicture from 'components/ReactPicture';
import PropTypes from 'prop-types';
import SvgIcon from 'components/SvgIcon';
import style from './style.scss';
import TrackableLink from './TrackableLink';

const LinkPicture = ({ link, image: { imageUrl, imageTitle } }) => (
  <div className={`${style.picture}`}>
    <TrackableLink
      className={`${style.picture}__link`}
      path={link}
      isOriginal={link.startsWith('https://') || link.startsWith('http://')}
      menuType="primary_menu"
      text={imageTitle}
    >
      <ReactPicture
        srcset={imageUrl}
        className={`${style.picture}__image`}
        alt={imageTitle}
        loader={{
          ratio: 0.67,
          size: 'cover',
        }}
      />

      <div className={`${style.picture}__text`}>
        <span>{imageTitle}</span>
        <SvgIcon name="line-right-arrow" className={`${style.picture}__arrow`} />
      </div>
    </TrackableLink>
  </div>
);

LinkPicture.propTypes = {
  link: PropTypes.string,
  image: PropTypes.object,
};

export default LinkPicture;
