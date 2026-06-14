import React from 'react';
import PropTypes from 'prop-types';
import lang from 'utils/lang';

const ShipmentStatus = (props) => {
  const { shipment, className } = props;
  if (shipment.state === 'pending' || shipment.state === 'backorder' || shipment.state === 'ready') {
    return (
      <div className={className}>
        <span>{lang.t('common.dispatch')}</span>
        <strong style={{ whiteSpace: 'pre-wrap' }}>
          {shipment.estimated_delivery_date_presentation
            ? `Estimated delivery:\n${shipment.estimated_delivery_date_presentation}`
            : shipment.estimated_dispatch_date_presentation}
        </strong>
      </div>
    );
  }
  if (shipment.state === 'shipped') {
    return (
      <div className={className}>
        <span>Shipping In Progress</span>
        {shipment.tracking_urls?.map((trackingUrl, i, urls) => (
          <div key={i}>
            <a href={trackingUrl} target="_blank" rel="noopener">
              Track Shipping {urls.length > 1 && i + 1}
            </a>
          </div>
        ))}
      </div>
    );
  }
  if (shipment.state === 'canceled') {
    return <div className={className}>Cancelled</div>;
  }
  return <div className={className}>Shipped</div>;
};

ShipmentStatus.propTypes = {
  shipment: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default ShipmentStatus;
