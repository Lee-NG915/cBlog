import React, { useState } from 'react';
import PropTypes from 'prop-types';
// import { useABTest } from 'hooks/ABTest';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { CheckCircleFilled, Close } from '@castlery/fortress/Icons';
import { Link, Typography } from '@castlery/fortress';
import CartRecsWidget from './CartRecsWidget';
import { Toast } from './CartRecsWidget/Toast';

const CartRecommendation = ({ cartType }) => {
  // const { variantionData, reportClick } = useABTest({ campaignName: 'More Cart Recs Test' }) || {};
  // const isVariantB = variantionData?.variant === 'B';
  const [toast, setToast] = useState({
    open: false,
    type: '',
    text: '',
  });
  const { mobile } = useBreakpoints();
  return (
    <div>
      <Toast
        autoHideDuration={3000}
        theme="dark"
        open={toast.open}
        anchorOrigin={{
          vertical: mobile ? 'bottom' : 'top',
          horizontal: mobile ? 'center' : 'right',
        }}
        onClose={() => setToast({ open: false, type: '' })}
        startDecorator={<CheckCircleFilled width={24} height={24} />}
        endDecorator={<Close width={24} height={24} onClick={() => setToast({ open: false, type: '' })} />}
        sx={{
          color: '#F6F3E7',
        }}
        actionSlot={
          toast.type === 'addWishlist' ? (
            <Link
              level="body1"
              sx={{
                textDecoration: 'underline',
                textDecorationColor: '#F6F3E7',
                color: '#F6F3E7',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                  textDecorationColor: '#F6F3E7',
                  color: '#F6F3E7',
                },
              }}
              href={`${__BASE_ROUTE__}/wishlist`}
            >
              <Typography level="body1" sx={{ color: '#F6F3E7' }}>
                View Wishlist
              </Typography>
            </Link>
          ) : null
        }
      >
        <Typography level="body1" sx={{ color: '#F6F3E7' }}>
          {toast.text}
        </Typography>
      </Toast>
      <CartRecsWidget cartType={cartType} campaignName="Cart Recommendations" setToast={setToast} />
      <CartRecsWidget
        cartType={cartType}
        campaignName="Cart Recommendations 2"
        showFallbackList={false}
        setToast={setToast}
      />
      <CartRecsWidget
        cartType={cartType}
        campaignName="Cart Recommendations 3"
        showFallbackList={false}
        setToast={setToast}
      />
      {/* <CartRecsWidget cartType={cartType} campaignName="Cart Recommendations" onItemClick={reportClick} />
      {isVariantB && (
        <>
          <CartRecsWidget
            cartType={cartType}
            campaignName="Cart Recommendations 2"
            showFallbackList={false}
            onItemClick={reportClick}
          />
          <CartRecsWidget
            cartType={cartType}
            campaignName="Cart Recommendations 3"
            showFallbackList={false}
            onItemClick={reportClick}
          />
        </>
      )} */}
    </div>
  );
};
CartRecommendation.propTypes = {
  cartType: PropTypes.string,
};

export default CartRecommendation;
