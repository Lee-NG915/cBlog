import * as React from 'react';
import { Box } from '@castlery/fortress';

interface DetailsShipmentStatusProps {
  shipment: any;
  sx?: any;
}

const DetailsShipmentStatus: React.FC<DetailsShipmentStatusProps> = (props: DetailsShipmentStatusProps) => {
  const { shipment, sx } = props;
  if (shipment.state === 'pending' || shipment.state === 'backorder' || shipment.state === 'ready') {
    return (
      <Box sx={sx}>
        {shipment.estimated_delivery_date_presentation ? (
          <React.Fragment>
            <span>Estimated Delivery Date</span>
            <strong>{shipment.estimated_delivery_date_presentation}</strong>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span>Estimated Dispatch Date</span>
            <strong>{shipment.estimated_dispatch_date_presentation}</strong>
          </React.Fragment>
        )}
      </Box>
    );
  } else if (shipment.state === 'shipped') {
    return (
      <Box sx={sx}>
        <span>Shipping In Progress</span>
        <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
          Track Shipping
        </a>
      </Box>
    );
  } else {
    return <Box sx={sx}>Shipped</Box>;
  }
};

export default DetailsShipmentStatus;
