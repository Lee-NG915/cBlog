'use client';
import { Link, CircularProgress, circularProgressClasses, useBreakpoints } from '@castlery/fortress';
import { Edit } from '@castlery/fortress/Icons';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectCheckoutZipcode, selectUpdateCheckoutZipcodeLoading } from '@castlery/modules-checkout-domain';
import { CartCheckoutZipcodeSelector, useGetTransactionStepStates } from '@castlery/shared-components';

export function CheckoutChangeZipcodeButton({ disabled = false }: { disabled?: boolean }) {
  const zipcode = useAppSelector(selectCheckoutZipcode);
  const updateCheckoutZipcodeLoading = useAppSelector(selectUpdateCheckoutZipcodeLoading);
  const isLoading = updateCheckoutZipcodeLoading;

  const { getStepStates } = useGetTransactionStepStates();
  const { enableUpdateZipcode } = getStepStates();
  const { mobile } = useBreakpoints();

  if (!zipcode || !enableUpdateZipcode) return null;

  const iconSize = mobile ? 16 : 20;

  return (
    <CartCheckoutZipcodeSelector
      inCheckout
      actionComponent={({ openModal }) => (
        <Link
          level="body2"
          variant="primary"
          underline="always"
          component="button"
          disabled={disabled}
          endDecorator={isLoading ? <></> : <Edit sx={{ width: iconSize, height: iconSize, minHeight: iconSize }} />}
          sx={{
            alignItems: 'center',
            lineHeight: 1.25,
            [`& .${circularProgressClasses.root}`]: {
              '--CircularProgress-size': `${iconSize}px`,
            },
          }}
          onClick={isLoading ? undefined : openModal}
        >
          {isLoading ? <CircularProgress color="primary" /> : `${zipcode.city}, ${zipcode.zipcode}`}
        </Link>
      )}
    />
  );
}
