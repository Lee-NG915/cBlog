import { Button } from '@castlery/fortress';
import { stripeUtil } from '@castlery/utils';

export const StripeCancelButton = () => {
  const onCancel = async () => {
    const unexpectedErrors = await stripeUtil.cancelAnyActivePaymentFlow();
    if (unexpectedErrors.length > 0) {
      console.error('[stripe terminal]cancel payment flow failed:', unexpectedErrors);
    }
  };
  return (
    <Button variant="secondary" color="neutral" size="lg" onClick={onCancel}>
      Cancel
    </Button>
  );
};

export default StripeCancelButton;
