/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import { getLinkWithQuery } from 'utils/link';
import Banner from 'components/Banner';
import ReviewTerms from 'components/ReviewTerms';
import * as Cookie from 'helpers/Cookie';
import { isOutdated } from 'utils/time';
import { Container } from '@castlery/fortress';
import { globalFeatureInAU } from 'config';
import ReviewItem from './ReviewItem';

import style from './style.scss';

@wrapPage({ border: true })
export default class ReviewSubmission extends React.Component {
  static propTypes = {
    location: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  state = {
    error: '',
    loading: true, // loading items
    items: [],
  };

  client = new ApiClient();

  componentDidMount() {
    const accessToken = Cookie.get('access_token');
    if (!accessToken) {
      this.context.frame.openModal('login', {
        onSuccess: () => {
          this.loadOrder();
        },
        onClose: () => {
          // setError(true);
        },
      });
    } else {
      // logged in
      this.loadOrder();
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.location.query.order !== this.props.location.query.order ||
      nextProps.location.query.shipment !== this.props.location.query.shipment
    ) {
      this.loadOrder();
    }
  }

  onItemFinish = (productId, variantId) => {
    const { items } = this.state;
    let newItems = [];
    if (items) {
      newItems = items.filter((item) => !(item.variant.product_id === productId && item.variant.id === variantId));
      this.setState({
        items: newItems,
      });
    }
    if (newItems.length <= 0) {
      this.context.frame.scrollToTop();
    }
  };

  loadOrder() {
    const { location } = this.props;
    const { ...queries } = location.query;

    const options = {
      params: {
        shipment_id: queries.shipment,
      },
      auth: 'strict',
    };

    this.client
      .get('/gw/reviews/needed_items', options)
      .then((items) => {
        this.setState({
          loading: false,
          items,
          error: '',
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          items: null,
          error: error.errors ? error.errors[0].detail : error.toString(),
        });

        // if one_time_token is expired, open login modal
        if (error.errors[0].status === 'Unauthorized' || error.status === 401) {
          const newUrl = getLinkWithQuery('submit-review', queries);
          this.context.frame.openModal('login', {
            onSuccess: () => {
              this.context.router.replace(newUrl);
            },
          });
        }
      });
  }

  render() {
    const { items, loading, error } = this.state;
    const { location } = this.props;

    let content;

    if (loading) {
      content = (
        <div className={`${style.reviewSubmission}__loading`}>
          <Spinner />
        </div>
      );
    } else if (error) {
      content = <div className={`${style.reviewSubmission}__error`}>{error}</div>;
    } else if (items.length === 0) {
      content = (
        <div className={`${style.reviewSubmission}__error`}>
          You've reviewed all your purchased products.
          <br />
          You can check them under <Link to={getUrl('my-reviews')}>Reviews</Link>
        </div>
      );
    } else {
      content = (
        <div>
          <div className={`${style.reviewSubmission}__intro`}>
            <p>
              Help fellow shoppers find the right product for their needs!
              <br />
              Simply review your purchased items and earn discounts off your next order.
              <br />
              Each published review earns you a voucher!
            </p>
            {!isOutdated('2023-04-01 00:00', '2023-05-01 00:00') && (
              <p className={`${style.reviewSubmission}__giveaway`}>
                Join Our Giveaway!
                <br />
                For a limited time, submit a review for the chance to win one of three $500 Castlery gift vouchers! Add
                a photo to increase your odds and get detailed with your feedback - the more descriptive, the better.
                <br />
                <br />
                Each published review counts as 1 entry in the giveaway. Add a photo for an extra entry.{' '}
                <a href={`${__BASE_ROUTE__}/promo-terms`} target="_blank">
                  Learn more.
                </a>
              </p>
            )}
            {!isOutdated('2023-09-28 00:00', '2023-11-23 00:00') && globalFeatureInAU && (
              <p className={`${style.reviewSubmission}__giveaway`}>
                Join Our Giveaway!
                <br />
                For a limited time, submit a review for the chance to win one of three $500 Castlery gift vouchers! Add
                a photo to increase your odds and get detailed with your feedback – the more descriptive, the better.
                <br />
                <br />
                Each published review counts as 1 entry in the giveaway. Add a photo for an extra entry.
              </p>
            )}
          </div>
          <div className={`${style.reviewSubmission}__coupons`}>
            <div className={`${style.reviewSubmission}__coupon-wrapper`}>
              <div className={`${style.reviewSubmission}__coupon ten-voucher`}>
                {__YOTPO_ENABLED__ ? (
                  <p>
                    30 <span>Credits</span>
                  </p>
                ) : (
                  <p>
                    $30 <span>Voucher</span>
                  </p>
                )}
              </div>
              <p className={`${style.reviewSubmission}__coupon-title`}>Text Review</p>
              <p className={`${style.reviewSubmission}__coupon-description`}>Published text reviews without images.</p>
            </div>
            <div className={`${style.reviewSubmission}__coupon-wrapper`}>
              <div className={`${style.reviewSubmission}__coupon thirty-voucher`}>
                {__YOTPO_ENABLED__ ? (
                  <p>
                    50 <span>Credits</span>
                  </p>
                ) : (
                  <p>
                    $50 <span>Voucher</span>
                  </p>
                )}
              </div>
              <p className={`${style.reviewSubmission}__coupon-title`}>Image Review</p>
              <p className={`${style.reviewSubmission}__coupon-description`}>
                Published reviews with text and images of purchased product(s).
              </p>
            </div>
          </div>
          <em className={`${style.reviewSubmission}__quick-tip`}>
            <strong>Quick tip:</strong> Upload your best photos and include feedback such as what you like about the
            product and how it fits into your home interior. Remember to submit different images per product reviewed.
          </em>
          {items.map((item, index) => (
            <ReviewItem
              className={index === 0 ? 'first' : ''}
              key={item.id}
              item={item}
              orderNumber={location.query.order}
              onFinish={this.onItemFinish}
            />
          ))}
        </div>
      );
    }

    return (
      <div>
        <Container>
          <div className={style.reviewSubmission}>
            <Banner
              className={`${style.reviewSubmission}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: '/static/submit-review/submit-review-mobile-v2.jpg',
                  loader: { ratio: 0.8133 },
                },
                {
                  breakpoint: 'lg',
                  srcset: '/static/submit-review/submit-review-v2.jpg',
                  loader: { ratio: 0.4166 },
                },
              ]}
              title="Review & Be Rewarded"
            >
              <h1>Review & Be Rewarded</h1>
            </Banner>
            {content}
          </div>
        </Container>

        <ReviewTerms className={style.terms} />
      </div>
    );
  }
}
