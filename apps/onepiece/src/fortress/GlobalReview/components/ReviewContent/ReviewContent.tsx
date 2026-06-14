import React, { useCallback } from 'react';
import { Link } from 'react-router';
import { Box, Stack, Typography } from 'fortress';
import ReviewDate from '../ReviewDate/ReviewDate';
import useBreakpoints from 'fortress/hooks/useBreakpoints/useBreakpoints';
import { type ReviewContentProps } from 'fortress/GlobalReview/types/types';
import ReviewReply from '../ReviewReply/ReviewReply';
import ReviewImageList from '../ReviewImageList/ReviewImageList';
import { getVariantLink } from 'utils/link';
import { useDispatch } from 'react-redux';
import { EVENT_PDP_REVIEW_SECTION } from 'utils/track/constants';

const ReviewContent = ({ replies, title, content, imageList, relativeProduct, createdAt }: ReviewContentProps) => {
  const { mobile } = useBreakpoints();
  const dispatch = useDispatch();
  const trackReviewEvent = useCallback(
    (action) => {
      dispatch({
        type: EVENT_PDP_REVIEW_SECTION,
        result: {
          detailAction: action,
          label: '',
        },
      });
    },
    [dispatch]
  );
  const renderTitle = () => {
    return (
      <Stack
        sx={() => ({
          marginBottom: 1,
        })}
      >
        <Typography
          sx={(theme) => ({
            color: theme.palette.brand.charcoal[900],
            fontSize: '1rem',
            fontWeight: 600,
          })}
        >
          {title}
        </Typography>
      </Stack>
    );
  };
  const renderContent = () => {
    return (
      <Stack
        sx={() => ({
          marginBottom: 3,
          width: '100%',
        })}
      >
        <Typography
          sx={(theme) => ({
            width: '100%',
            color: theme.palette.brand.charcoal[900],
            fontSize: '1rem',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            // overflow: 'hidden',
          })}
        >
          {content}
        </Typography>
      </Stack>
    );
  };
  const renderRelativeProduct = () => {
    return (
      <Stack>
        <Typography
          sx={(theme) => ({
            fontSize: '0.875rem',
            color: theme.palette.brand.charcoal[600],
          })}
        >
          Review on {relativeProduct.relation_type === 'related' ? 'similar product' : ''}{' '}
          {relativeProduct.linkNeeded.is_available === true ? (
            <Link
              href={`${__BASE_ROUTE__}${getVariantLink(
                relativeProduct.linkNeeded,
                relativeProduct.linkNeeded.product_slug
              )}`}
              onClick={() => trackReviewEvent('click_review_link')}
            >
              <Typography
                sx={(theme) => ({
                  fontSize: '0.875rem',
                  color: theme.palette.brand.charcoal[600],
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'none',
                    color: '#995334',
                  },
                })}
              >
                {relativeProduct.name}
              </Typography>
            </Link>
          ) : (
            <Typography
              sx={(theme) => ({
                fontSize: '0.875rem',
                color: theme.palette.brand.charcoal[600],
              })}
            >
              {relativeProduct.name}
            </Typography>
          )}
        </Typography>
      </Stack>
    );
  };
  return (
    <Stack
      sx={() => ({
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        overflow: 'hidden',
      })}
    >
      <Box
        sx={() => ({
          boxSizing: 'border-box',
          marginRight: mobile ? 0 : 4,
          width: '100%',
          overflow: 'hidden',
        })}
      >
        {renderTitle()}
        {renderContent()}
        <ReviewImageList imageList={imageList} title={title} />
        {renderRelativeProduct()}
        <ReviewReply replies={replies} />
      </Box>
      {!mobile && <ReviewDate date={createdAt} />}
    </Stack>
  );
};

export { ReviewContent, ReviewContentProps };
