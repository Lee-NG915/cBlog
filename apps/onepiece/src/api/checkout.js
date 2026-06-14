import { client } from 'helpers/ApiClient';

/**
 * @typedef {Object} ShipmentAttribute
 * @property {number} id
 * @property {string} preferred_delivery_date
 *
 * @typedef {Object} ShipmentOption
 * @property {string} mode
 * @property {string} preferred_estimated_delivery_date
 * @property {ShipmentAttribute[]} shipment_attributes
 */
export const updateDeliveryOptions = ({ orderNumber, data }) => {
  const url = `/checkouts/${orderNumber}/delivery_option`;
  return client.put(url, {
    auth: 'strict',
    data,
  });
};
