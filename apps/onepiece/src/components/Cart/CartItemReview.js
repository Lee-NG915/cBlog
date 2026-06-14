import React, { useEffect, useState, useMemo } from 'react';
import Rating from 'components/Rating';
import PropTypes from 'prop-types';
import { getCartItemReview } from 'api/cart';
import { Box, Typography } from '@castlery/fortress';
import { getLineItemLink } from 'utils/link';
import { useDispatch } from 'react-redux';

import { EVENT_LINK_CLICK } from 'utils/track/constants';

export default function CartItemReview({ lineItem, className }, { router }) {
  const [rating, setRating] = useState(5);
  const [ratingCount, setRatingCount] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (lineItem?.variant?.sku) {
      getCartItemReview({ variantCode: lineItem?.variant?.sku }).then((res) => {
        setRating(res?.average_rating || 0);
        setRatingCount(res?.total_count || 0);
      });
    }
  }, [lineItem]);

  const showReviewRating = useMemo(() => ratingCount > 0 && rating > 3, [rating, ratingCount]);

  const handleClick = () => {
    const link = getLineItemLink(lineItem);
    dispatch({
      type: EVENT_LINK_CLICK,
      result: {
        category: 'link_click',
        action: 'click_cart_items_review',
        label: lineItem?.variant?.sku,
      },
    });
    const hashLink = link ? `${link}#reviews` : '';
    window.location.href = `${__BASE_URL__}${hashLink}`;
    // router.push(hashLink);
  };

  return (
    <>
      {showReviewRating && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={(theme) => ({
            cursor: 'pointer',
            '&:hover .cartItemReviewsCount': {
              color: theme.palette.primary[600],
            },
          })}
          onClick={(e) => {
            handleClick(e);
          }}
          className={className}
        >
          <Rating rating={rating} />
          <Typography ml={0.5} component="span" level="caption1" className="cartItemReviewsCount" textColor="#D25C1B">
            (
            <Box
              component="span"
              sx={() => ({
                textDecoration: 'underline',
                color: '#D25C1B',
              })}
            >
              {ratingCount}
            </Box>
            )
          </Typography>
        </Box>
      )}
    </>
  );
}

CartItemReview.propTypes = {
  lineItem: PropTypes.object,
  className: PropTypes.string,
};

CartItemReview.contextTypes = {
  router: PropTypes.object,
};
