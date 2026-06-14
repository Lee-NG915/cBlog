import React, { useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import DisposalService from 'components/DeliveryService/DisposalService';
import CarryUpService from 'components/DeliveryService/CarryUpService';
import { FrameContext } from './FrameContext';

import style from './style.scss';

const DeliveryServicesDetail = ({ serviceProduct, selectedService, handleConfirmServices }) => {
  const frame = useContext(FrameContext);
  const [loading, setLoading] = useState(false);

  const closeHandler = (e) => {
    if (e.target.classList.contains(style.deliveryServicesDetail)) {
      frame.removeModal();
    }
  };

  const onConfirmServices = useCallback(
    (services) => {
      if (!serviceProduct) {
        console.error('[Error in DeliveryServicesDetail]>> serviceProduct is not defined');
        return;
      }
      setLoading(true);
      handleConfirmServices(serviceProduct.type, services)
        .then(() => {
          frame.removeModal();
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [frame, handleConfirmServices, serviceProduct]
  );

  const Content = serviceProduct.type === 'carry_up' ? CarryUpService : DisposalService;

  return (
    <div role="menuitem" className={style.deliveryServicesDetail} onClick={closeHandler}>
      <div className={`${style.deliveryServicesDetail}__container`}>
        <Content
          serviceProduct={serviceProduct}
          onConfirmServices={onConfirmServices}
          selectedService={selectedService}
        />

        {loading && (
          <div className={`${style.deliveryServicesDetail}__mask`}>
            <Spinner />
          </div>
        )}

        <button
          type="button"
          className={classNames('btn', `${style.deliveryServicesDetail}__close`)}
          onClick={() => frame.removeModal()}
        >
          <ReactSVG name="close" />
        </button>
      </div>
    </div>
  );
};

DeliveryServicesDetail.propTypes = {
  serviceProduct: PropTypes.object,
  selectedService: PropTypes.object,
  handleConfirmServices: PropTypes.func,
};
DeliveryServicesDetail.animation = 'plain';

export default DeliveryServicesDetail;
