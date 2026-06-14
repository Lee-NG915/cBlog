import React from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import classNames from 'classnames';
import style from './style.scss';
import { ASSEMBLY_TYPE } from './config';

const LineItemBundleOptions = (props) => {
  const { lineItem, className, mediaQuery, showVariant, fromShippingMethod } = props;

  if (lineItem.product_type === 'bundle' && lineItem.product_layout !== 'bundle_overlay') {
    return (
      <div className={classNames(style.bundle, className)}>
        {lineItem.bundle_line_items.map((item) => {
          if (!item.variant) {
            return null;
          }
          const variantOptions = item.variant.variant_option_values?.slice() || [];
          if (__COUNTRY__ !== 'SG' && item?.variant?.assembly_type) {
            variantOptions.push({ presentation: ASSEMBLY_TYPE[item.variant.assembly_type] });
          }
          return (
            <div key={item.id}>
              <div className={`${style.bundle}__img`}>
                {item.variant.images[0] ? (
                  <ReactPicture
                    srcset={item.variant.images[0].links}
                    alt={item.variant.product_name}
                    loader={{
                      ratio: 0.667,
                      widths: [100, 150, 200],
                      sizes: mediaQuery,
                    }}
                    lazy={false}
                  />
                ) : (
                  <ReactPicture alt={item.variant.product_name} loader={{ ratio: 0.667 }} />
                )}
              </div>

              {fromShippingMethod ? (
                <div className={`${style.bundle}__info`}>
                  <div className={`${style.bundle}__info__name`}>{item.variant.product_name}</div>

                  {showVariant && (
                    <div className={`${style.bundle}__info__option`}>
                      {variantOptions.map((v) => v.presentation).join(' | ')}
                    </div>
                  )}

                  <div className={`${style.bundle}__info__qty`}>Quantity: {item.quantity}</div>
                </div>
              ) : (
                <div className={`${style.bundle}__info`}>
                  <p>
                    {item.quantity} x {item.variant.product_name}
                  </p>

                  {showVariant &&
                    item.variant.variant_option_values.map((v) => (
                      <p key={v.option_type_id}>
                        {v.option_type_presentation}: {v.presentation}
                      </p>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

LineItemBundleOptions.propTypes = {
  lineItem: PropTypes.object.isRequired,
  className: PropTypes.string,
  mediaQuery: PropTypes.string,
  showVariant: PropTypes.bool,
  fromShippingMethod: PropTypes.bool,
};
LineItemBundleOptions.defaultProps = {
  showVariant: true,
};

export default LineItemBundleOptions;
