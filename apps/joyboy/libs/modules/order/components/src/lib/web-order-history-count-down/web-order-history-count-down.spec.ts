import { OrderDataV1 } from '@castlery/types';
import { canShowWebOrderHistoryPayButton } from './web-order-history-count-down';

const baseOrder = {
  id: '1',
  status: 'PENDING_PAYMENT',
  channel: 'web',
  payments: [],
} as OrderDataV1;

describe('canShowWebOrderHistoryPayButton', () => {
  it('returns true for pending payment web orders without processing payments', () => {
    expect(canShowWebOrderHistoryPayButton(baseOrder)).toBe(true);
  });

  it('returns false when order status is not pending payment', () => {
    expect(canShowWebOrderHistoryPayButton({ ...baseOrder, status: 'COMPLETED' })).toBe(false);
  });

  it('returns false for pos channel orders', () => {
    expect(canShowWebOrderHistoryPayButton({ ...baseOrder, channel: 'pos' })).toBe(false);
  });

  it('returns false when a payment is processing', () => {
    expect(
      canShowWebOrderHistoryPayButton({
        ...baseOrder,
        payments: [{ paymentState: 'PAYMENT_STATUS_PROCESSING' }],
      } as OrderDataV1)
    ).toBe(false);
  });
});
