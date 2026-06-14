import React from 'react';
import PropTypes from 'prop-types';
import PriceDisplay from 'components/PriceDisplay';
import Bem from 'utils/bem';
import { globalFeatureInAU, globalFeatureInUK, enableFreeROC } from 'config';
import style from './style.scss';

const AddOnServicePrice = ({ shipment, item, separateDisplay, className }) => {
  const block = new Bem(style.addOnServicePrice).mix(className);
  const { type, amount, original_amount: originalAmount } = item || {};
  let serviceItem = item;

  if (separateDisplay) {
    const standardFee = +shipment.basic_shipping_fee;

    if (globalFeatureInAU || globalFeatureInUK) {
      serviceItem = {
        ...item,
        addOnFee: type === 'standard' ? +amount + standardFee : amount,
        originalAddOnFee: originalAmount,
      };
    } else if (type !== 'standard_service') {
      serviceItem = {
        ...item,
        addOnFee: amount - standardFee,
        originalAddOnFee: Number(standardFee) === 0 ? undefined : originalAmount,
      };
    }
  }

  if (!serviceItem) {
    return null;
  }

  return (
    <div className={block}>
      {type === 'standard' || type === 'standard_service' || !separateDisplay ? (
        <PriceDisplay price={serviceItem.amount} originalPrice={serviceItem.original_amount} />
      ) : (
        <span className={block.elm('plus').toString()}>
          <PriceDisplay
            price={serviceItem.addOnFee}
            originalPrice={serviceItem.originalAddOnFee}
            priceCanBeFree={!enableFreeROC}
            showPlusSymbol={separateDisplay}
          />
        </span>
      )}
    </div>
  );
};

AddOnServicePrice.defaultProps = {
  separateDisplay: true,
};
AddOnServicePrice.propTypes = {
  shipment: PropTypes.object,
  item: PropTypes.object,
  separateDisplay: PropTypes.bool,
  className: PropTypes.string,
};

export default AddOnServicePrice;
