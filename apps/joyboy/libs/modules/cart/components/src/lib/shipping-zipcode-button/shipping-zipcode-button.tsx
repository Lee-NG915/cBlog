'use client';
import { Link, CircularProgress, circularProgressClasses, useBreakpoints } from '@castlery/fortress';
import { Edit } from '@castlery/fortress/Icons';
import { selectCartZipcode, selectZipcodeLoading } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { CartCheckoutZipcodeSelector } from '@castlery/shared-components';

export function ShippingZipcodeButton({ disabled = false }: { disabled?: boolean }) {
  const zipcode = useAppSelector(selectCartZipcode);
  const zipcodeLoading = useAppSelector(selectZipcodeLoading);
  const { mobile } = useBreakpoints();
  if (!zipcode) return null;

  return (
    <CartCheckoutZipcodeSelector
      actionComponent={({ openModal }) => (
        <Link
          level="body2"
          variant="primary"
          underline="always"
          component="button"
          disabled={disabled}
          endDecorator={
            zipcodeLoading ? (
              <></>
            ) : (
              <Edit
                sx={{
                  width: 20,
                  height: 20,
                  minHeight: 20,
                  ...(mobile && {
                    width: 16,
                    height: 16,
                    minHeight: 16,
                  }),
                }}
              />
            )
          }
          sx={{
            alignItems: 'center',
            lineHeight: 1.25,
            [`& button`]: {
              height: 20,
              lineHeight: 1.25,
              minHeight: 20,
            },
            [`& .${circularProgressClasses.root}`]: {
              '--CircularProgress-size': mobile ? '16px' : '20px',
            },
          }}
          onClick={openModal}
        >
          {zipcodeLoading ? <CircularProgress /> : `${zipcode.city ? zipcode.city + ', ' : ''}${zipcode.zipcode || ''}`}
        </Link>
      )}
    />
  );
}
