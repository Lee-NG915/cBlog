import { Order } from '@castlery/types';
import { accessInUS } from '@castlery/config';

export function getCartValuesByOrder(order: Order) {
  let { total, included_tax_total: includedTaxTotal } = order || {};
  if (total === undefined) {
    total = '0';
  }
  if (includedTaxTotal === undefined) {
    includedTaxTotal = '0';
  }
  const totalValue = (+total).toFixed(2);
  return {
    cartValue: accessInUS ? null : totalValue, // total rev value of cart inc vat
    cartValueNet: accessInUS ? totalValue : (+total - +includedTaxTotal).toFixed(2), // total rev value of cart excl VAT/taxes
  };
}
