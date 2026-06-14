import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import ShipmentService from '../Checkout/components/ShipmentService';

import { FrameContext } from './FrameContext';

import style from './style.scss';

const UpgradeShippingMethods = ({ shipment }) => {
  const frame = useContext(FrameContext);
  const [loading, setLoading] = useState(false);

  const closeHandler = (e) => {
    if (e.target.classList.contains(style.upgradeShippingMethods)) {
      frame.removeModal();
    }
  };

  const handleChange = () => {
    setLoading(true);
  };

  const handleError = () => {
    setLoading(false);
    frame.removeModal();
  };

  const handleSuccess = () => {
    setLoading(false);
    frame.removeModal();
  };

  return (
    <div role="menuitem" className={style.upgradeShippingMethods} onClick={closeHandler}>
      <div className={`${style.upgradeShippingMethods}__container`}>
        <div className={`${style.upgradeShippingMethods}__header`}>Choose your shipping methods</div>

        <ShipmentService shipment={shipment} onChange={handleChange} onSuccess={handleSuccess} onError={handleError} />

        {loading && (
          <div className={`${style.upgradeShippingMethods}__mask`}>
            <Spinner />
          </div>
        )}

        <button
          type="button"
          className={classNames('btn', `${style.upgradeShippingMethods}__close`)}
          onClick={() => frame.removeModal()}
        >
          <ReactSVG name="close" />
        </button>
      </div>
    </div>
  );
};

UpgradeShippingMethods.propTypes = {
  shipment: PropTypes.object,
};
UpgradeShippingMethods.animation = 'plain';

export default UpgradeShippingMethods;
