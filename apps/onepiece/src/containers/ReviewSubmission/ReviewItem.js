import React from 'react';
import PropTypes from 'prop-types';
import { VariantForm } from 'components/ReviewForm';
import { LineItemName, LineItemOptions, LineItemProductImage } from 'components/LineItem';
import { toPrice } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';
import { TransitionMotion, spring } from 'react-motion';

import style from './style.scss';

const MIN_NUM_OF_TEXT = 50;
const TEXT_VOUCHER = 30;
const IMAGE_VOUCHER = 50;

export default class ShipmentReview extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    orderNumber: PropTypes.string.isRequired,
    shipmentId: PropTypes.string.isRequired,
    className: PropTypes.string,
    onFinish: PropTypes.func,
  };

  state = {
    success: false,
    coupon: 0,
  };

  onFormUpdate = (rating, content, images) => {
    const coupon = this.determineCoupon(content.length, Object.keys(images).length);
    if (this.state.coupon !== coupon) {
      this.setState({
        coupon,
      });
    }
  };

  onFormSuccess = (productId, variantId) => {
    const { onFinish } = this.props;
    this.setState({
      success: true,
    });
    if (onFinish) {
      onFinish(productId, variantId);
    }
  };

  determineCoupon(numOfText, numOfImages) {
    if (numOfText < MIN_NUM_OF_TEXT) {
      return 0;
    }

    if (numOfImages === 0) {
      return TEXT_VOUCHER;
    }

    return IMAGE_VOUCHER;
  }

  willEnter() {
    return { y: -100, opacity: 0 };
  }

  willLeave() {
    return {
      y: spring(50, { stiffness: 400, damping: 30 }),
      opacity: spring(0, { stiffness: 400, damping: 30 }),
    };
  }

  render() {
    // const { item, orderNumber, one_time_token, className } = this.props;
    const { item, orderNumber, className, shipmentId } = this.props;
    const { coupon, success } = this.state;

    if (success) {
      return null;
    }

    return (
      <div className={`${style.reviewItem} ${className}`}>
        <h2 className={`${style.reviewItem}__title`}>Review this product</h2>
        <div className={`${style.reviewItem}__container`}>
          <div className={style.item}>
            <LineItemProductImage
              mediaQuery="300px"
              lineItem={item}
              showLink={false}
              className={`${style.item}__image`}
            />
            <div className={`${style.item}__content`}>
              <LineItemName lineItem={item} showLink={false} className={`${style.item}__name`} />
              <LineItemOptions lineItem={item} className={`${style.item}__options`} />
              <div className={`${style.item}__price`}>
                {+item.variant.price !== +item.variant.list_price ? (
                  <div className={`${style.item}__price__sale`}>
                    <span aria-label={`Sale Price: ${toPrice(item.variant.price, true)}`}>
                      {toPrice(item.variant.price, true)}
                    </span>
                    <span aria-label={`Regular Price: ${toPrice(item.variant.list_price, true)}`}>
                      {toPrice(item.variant.list_price, true)}
                    </span>
                  </div>
                ) : (
                  <span aria-label={`Price: ${toPrice(item.variant.price, true)}`}>
                    {toPrice(item.variant.price, true)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className={style.coupon}>
              <div
                className={classNames(`${style.coupon}__icon`, {
                  'has-color': coupon > 0,
                  'use-credit': __YOTPO_ENABLED__,
                })}
              >
                <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true" focusable="false">
                  <linearGradient id="coupon-gradient" gradientTransform="rotate(30)">
                    <stop offset="0%" stopColor="#a45b37" />
                    <stop offset="100%" stopColor="#F06285" />
                  </linearGradient>
                </svg>
                <ReactSVG name="coupon" />
                <TransitionMotion
                  willEnter={this.willEnter}
                  willLeave={this.willLeave}
                  styles={[
                    {
                      key: coupon.toString(),
                      data: coupon,
                      style: {
                        y: spring(-50, { stiffness: 250, damping: 30 }),
                        opacity: spring(1, { stiffness: 250, damping: 30 }),
                      },
                    },
                  ]}
                >
                  {(interpolatedStyles) => (
                    <>
                      {interpolatedStyles.map((config) => (
                        <span
                          key={config.key}
                          style={{
                            WebkitTransform: `translate(-50%, ${config.style.y}%)`,
                            transform: `translate(-50%, ${config.style.y}%)`,
                            opacity: config.style.opacity,
                          }}
                        >
                          {__YOTPO_ENABLED__ ? (
                            <>
                              {config.data} <span>Credit{config.data > 0 && 's'}</span>
                            </>
                          ) : (
                            toPrice(config.data)
                          )}
                        </span>
                      ))}
                    </>
                  )}
                </TransitionMotion>
              </div>
              {(() => {
                if (coupon === 0) {
                  return (
                    <div className={`${style.coupon}__text`}>
                      Write more than {MIN_NUM_OF_TEXT} characters
                      <br />
                      to be eligible for reward!
                    </div>
                  );
                }

                if (coupon === TEXT_VOUCHER) {
                  return (
                    <div className={`${style.coupon}__text`}>
                      Add images of your purchase
                      <br />
                      to earn more rewards.
                    </div>
                  );
                }

                if (coupon === IMAGE_VOUCHER) {
                  return (
                    <div className={`${style.coupon}__text`}>
                      Great job! The more details you add,
                      <br />
                      the more useful your review.
                    </div>
                  );
                }

                return null;
              })()}
            </div>
            <VariantForm
              classNames={`${style.variantForm}`}
              orderNumber={orderNumber}
              shipmentId={shipmentId}
              productId={item.variant.product_id}
              bundleOptions={
                item.product_type === 'bundle'
                  ? item.bundle_line_items.map((i) => ({
                      bundle_option_id: i.bundle_option.id,
                      bundle_option_variant_id: i.variant.id,
                    }))
                  : undefined
              }
              variantId={item.variant.id}
              variantCode={item.variant.sku}
              onUpdate={this.onFormUpdate}
              onSuccess={this.onFormSuccess}
              coupon={coupon}
              showSubmit
            />
          </div>
        </div>
      </div>
    );
  }
}
