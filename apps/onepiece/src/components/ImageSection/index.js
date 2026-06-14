import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import { renderImage } from 'utils/image';

import style from './style.scss';

const ImageSection = ({
  image,
  mobileImage,
  title,
  desc,
  author,
  actionText,
  actionLink,
  isTextLink,
  imageOnLeft,
  className,
}) => (
  <div className={`${style.imageSection} ${className}`}>
    <div className={`${style.imageSection}__image`} style={{ order: imageOnLeft ? -1 : 1 }}>
      {renderImage(image.url, image.ratio, image.width, { alt: title })}
    </div>
    <div className={`${style.imageSection}__mobileImage`}>
      {renderImage(mobileImage.url, mobileImage.ratio, mobileImage.width, {
        alt: title,
      })}
    </div>
    <div className={`${style.imageSection}__body`}>
      {title && <h2 className={`${style.imageSection}__title`}>{title}</h2>}
      {desc && <div className={`${style.imageSection}__desc`}>{desc}</div>}
      {author && <div className={`${style.imageSection}__author`}>{author}</div>}
      {isTextLink ? (
        <Link to={actionLink}>{actionText}</Link>
      ) : (
        <Link className={`btn ${style.imageSection}__button`} to={actionLink}>
          {actionText}
        </Link>
      )}
    </div>
  </div>
);

ImageSection.propTypes = {
  image: PropTypes.object,
  mobileImage: PropTypes.object,
  title: PropTypes.string,
  desc: PropTypes.string,
  author: PropTypes.string,
  actionLink: PropTypes.string,
  actionText: PropTypes.string,
  isTextLink: PropTypes.bool,
  className: PropTypes.string,
  imageOnLeft: PropTypes.bool,
};

export default ImageSection;
