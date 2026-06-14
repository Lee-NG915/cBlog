import React from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import { getBreakpoint, getWidth } from 'utils/breakpoints';
import Like from './Like';

import style from './style.scss';

const GridItem = ({ review }) => {
  const image = (review.messages.length > 0 &&
    review.messages[0].images.length > 0 &&
    review.messages[0].images[0]) || { ratio: 0.6666 };

  return (
    <div className={style.gridItem}>
      <Link to={`${getUrl('at-home-with-castlery')}?id=${review.id}`}>
        <ReactPicture
          srcset={image.image_url}
          alt={`review from ${review.messages[0].user.firstname}`}
          loader={{ ratio: image.ratio }}
        />
      </Link>
      <div className={`${style.gridItem}__panel`}>
        <Like
          count={review.messages[0].count_like}
          messageId={review.messages[0].id}
          className={`${style.gridItem}__like`}
        />
      </div>
    </div>
  );
};

GridItem.propTypes = {
  review: PropTypes.object.isRequired,
};

export default GridItem;
