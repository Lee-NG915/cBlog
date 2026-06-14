import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadIfNeeded as loadReview } from 'redux/modules/reviewWidget';
import { Box, Typography } from '@castlery/fortress';
import { withUseBreakpoints } from 'utils/page';
import { EVENT_TRUSTPILOT_IMPRESSION, EVENT_TRUSTPILOT_CLICK } from 'utils/track/constants';
import TrustpilotRating from 'components/Rating/TrustpilotRating';
// import style from './style.scss';
@connect(
  (state) => ({
    reviewInfo: state.reviewWidget.data,
  }),
  (dispatch) => ({
    loadReview: () => dispatch(loadReview()),
    trackTrustpilotClick: () => dispatch({ type: EVENT_TRUSTPILOT_CLICK }),
    trackTrustpilotImpression: () => dispatch({ type: EVENT_TRUSTPILOT_IMPRESSION }),
  })
)
@withUseBreakpoints
export default class ReviewWidget extends React.Component {
  static propTypes = {
    reviewInfo: PropTypes.object,
    loadReview: PropTypes.func,
    trackTrustpilotClick: PropTypes.func,
    trackTrustpilotImpression: PropTypes.func,
  };

  componentDidMount() {
    const { loadReview, trackTrustpilotImpression } = this.props;
    loadReview();
    trackTrustpilotImpression();
  }

  trackTrustpilotClick = () => {
    const { trackTrustpilotClick } = this.props;
    trackTrustpilotClick();
  };

  render() {
    const { reviewInfo } = this.props;

    if (reviewInfo) {
      return (
        <a
          style={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            display: 'block',
            color: '#3C101E',
            backgroundColor: '#FBF9F4',
            boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.15)',
            padding: '8px 12px',
            zIndex: 100,
            border: '1px solid #FBF9F4',
          }}
          onClick={() => {
            this.trackTrustpilotClick();
            window.open('https://www.trustpilot.com/review/www.castlery.com', '_blank');
          }}
          href="https://www.trustpilot.com/review/www.castlery.com"
          target="_blank"
          rel="noopener"
        >
          <Box display="flex" flexDirection="column" gap="4px">
            <Box display="flex" flexDirection="row" gap={1}>
              <Typography
                level="caption1"
                sx={{
                  fontSize: '14px !important',
                  letterSpacing: '-0.42px !important',
                  color: '#3C101E',
                }}
              >
                {`Trustpilot Score  `}
              </Typography>

              <Typography
                level="caption1"
                sx={{
                  fontSize: '14px !important',
                  fontWeight: '700 !important',
                  letterSpacing: '-0.42px',
                  color: '#3C101E',
                }}
              >
                {reviewInfo.review_rating}
              </Typography>
            </Box>

            <TrustpilotRating rating={Number(reviewInfo.review_rating)} />
            <Typography
              level="caption2"
              sx={{
                color: '#3C101E',
              }}
            >
              Based on{' '}
              <Typography
                level="caption2"
                sx={{
                  color: '#3C101E',
                  fontWeight: '700 !important',
                }}
              >
                {`${Number(reviewInfo.review_count).toLocaleString('en-US')} reviews`}
              </Typography>
            </Typography>
          </Box>
        </a>
      );
    }
    return null;
  }
}
