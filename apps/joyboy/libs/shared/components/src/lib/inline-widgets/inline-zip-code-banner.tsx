'use client';
import { Chip, Typography, useBreakpoints } from '@castlery/fortress';
import { Shipping, ArrowRight } from '@castlery/fortress/Icons';
import { cartFeatureService } from '@castlery/modules-cart-services';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { CartCheckoutZipcodeSelector } from '../cart-checkout-zipcode-selector/cart-checkout-zipcode-selector';
import { accessInPos } from '@castlery/config';
export const InlineZipCodeBanner = () => {
  const { desktop } = useBreakpoints();
  const showShippingZipcode = cartFeatureService.showShippingZipcode;
  const isInMiniCart = useAppSelector(selectMiniCartMode);

  if ((desktop && !isInMiniCart) || !showShippingZipcode) return null;

  return (
    <CartCheckoutZipcodeSelector
      showToast
      surface="banner"
      actionComponent={({ openModal }) => (
        <Chip
          variant="solid"
          startDecorator={<Shipping sx={{ color: (theme) => theme.palette.brand.white }} />}
          color="success"
          sx={{
            width: '100%',
            maxWidth: '100%',
            justifyContent: 'space-between',
          }}
          onClick={openModal}
        >
          <Typography
            level={accessInPos ? 'caption1' : 'body1'}
            endDecorator={<ArrowRight sx={{ color: (theme) => theme.palette.brand.white, fontSize: 16 }} />}
            sx={{ width: '100%', justifyContent: 'space-between', color: (theme) => theme.palette.brand.white }}
          >
            Enter zip code to calculate shipping cost
          </Typography>
        </Chip>
      )}
    />
  );
};

// Backward-compatible alias for gradual migration.
export const ZipCodeBanner = InlineZipCodeBanner;

export default InlineZipCodeBanner;
