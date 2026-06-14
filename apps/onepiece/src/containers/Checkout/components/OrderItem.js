import React from 'react';
import PropTypes from 'prop-types';
import { LineItemProductImage, LineItemOptions, LineItemName, LineItemBundleOptions } from 'components/LineItem';
import Bem from 'utils/bem';
import Tag from 'components/Tag';
import lang from 'utils/lang';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import style from './style.scss';

const OrderItem = (props) => {
  const { item, className, direction, showBundle } = props;
  const block = new Bem(style.orderItem).mix(style[direction]).mix(className);

  const hideQuantity =
    item.custom_attributes && (item.custom_attributes.type === 'slot' || item.custom_attributes.type === 'carry_up');

  const tags = [];
  if (item.variant?.is_clearance) {
    tags.push('clearance');
  } else if (item.variant?.is_customized) {
    tags.push('customised');
  }

  return (
    <div className={block}>
      <div>
        <div className={block.elm('left')}>
          {tags.length > 0 && (
            <div className={block.elm('tag').toString()}>
              <Tag tags={tags} showCustomized />
            </div>
          )}

          {item.variant.images && (
            <LineItemProductImage lineItem={item} className={block.elm('img').toString()} mediaQuery="120px" />
          )}
        </div>

        <div className={block.elm('body')}>
          <LineItemName lineItem={item} className={block.elm('name').toString()} />

          <LineItemOptions
            lineItem={item}
            className={block.elm('options').toString()}
            type="joint"
            showAssembly={__COUNTRY__ !== 'SG'}
          />

          {!hideQuantity && <div className={block.elm('qty')}>Quantity: {item.quantity}</div>}

          <div className={block.elm('customizeText')}>
            {tags.length === 2 && (
              <>
                This clearance and {lang.t('common.customized_checkout_text')} item is not eligible for returns,
                exchanges, or refunds.&ensp;
                <Link
                  target="_blank"
                  href={`${__BASE_URL__}${getUrl('sales-and-refunds')}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  More info here.
                </Link>
              </>
            )}
            {tags.length === 1 && tags[0] === 'clearance' && (
              <>
                This clearance item is not eligible for returns, exchanges, or refunds.&ensp;
                <Link
                  target="_blank"
                  href={`${__BASE_URL__}${getUrl('sales-and-refunds')}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    a: {
                      color: '#d25c1b',
                    },
                  }}
                >
                  More info here.
                </Link>
              </>
            )}
            {tags.length === 1 && tags[0] === 'customised' && (
              <>
                This {lang.t('common.customized_checkout_text')} item is not eligible for returns, exchanges, or
                refunds.&ensp;
                <Link
                  target="_blank"
                  href={`${__BASE_URL__}${getUrl('sales-and-refunds')}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  More info here.
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showBundle && (
        <LineItemBundleOptions
          lineItem={item}
          showVariant
          className={block.elm('bundle').toString()}
          mediaQuery="120px"
          fromShippingMethod
        />
      )}
    </div>
  );
};

OrderItem.propTypes = {
  item: PropTypes.object.isRequired,
  className: PropTypes.string,
  direction: PropTypes.string,
  showBundle: PropTypes.bool,
};

OrderItem.defaultProps = {
  direction: 'row',
};

export default OrderItem;
