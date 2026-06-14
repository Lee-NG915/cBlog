import { client } from 'helpers/ApiClient';

export const getShipmentOptions = ({ orderNumber }) => {
  // /api/orders/{order_number}/shipment_options
  const url = `/orders/${orderNumber}/shipment_options`;
  return client.get(url, {
    auth: 'strict',
  });
};
