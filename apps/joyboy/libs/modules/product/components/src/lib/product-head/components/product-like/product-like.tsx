'use client';

import {
  CircularProgress,
  circularProgressClasses,
  Radio,
  RadioGroup,
  Toast,
  Typography,
  useBreakpoints,
} from '@castlery/fortress';
import { CheckCircleFilled, Close, Favorite, FavoriteFilled } from '@castlery/fortress/Icons';
import { addWishlist, deleteWishlist, getWishListSelect, selectedWishList } from '@castlery/modules-user-domain';
import { CustomLink } from '@castlery/shared-components';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { useMemo, useState } from 'react';
import type { BundleVariants, Product, Variant } from '@castlery/modules-product-domain';
import { EVENT_ADD_TO_WISHLIST } from '@castlery/modules-tracking-services';
import { usePrice } from '../../../../hooks/use-price';

interface ProductLikeProps {
  product: Product;
  variant: Variant;
  bundleVariant?: BundleVariants;
}

export const ProductLike = (props: ProductLikeProps) => {
  const { product, variant, bundleVariant } = props;
  const variantId = variant?.id;
  const dispatch = useAppDispatch();
  const { desktop, mobile } = useBreakpoints();
  const currentWishListData = useAppSelector(selectedWishList);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastStatus, setToastStatus] = useState<'add' | 'remove'>('add');
  const { numberVariantPrice } = usePrice({ product, variant, bundleVariant });

  const { isLoading: isWishListLoading } = useAppSelector(getWishListSelect());

  const isLoading = isWishListLoading || !variantId || toggleLoading;

  // const { isLoading: theLookWishListIsLoading } = useAppSelector(getTheLookWishListSelect());

  const liked = useMemo(() => {
    return currentWishListData.findIndex((item) => item.id === variantId) > -1;
  }, [currentWishListData, variantId]);

  const handleTrackAddToWishlist = async () => {
    if (!variant) {
      // variant not found, skip tracking
      return;
    }
    await dispatch(
      EVENT_ADD_TO_WISHLIST({
        variant: {
          name: variant?.name,
          sku: variant?.sku,
          price: (numberVariantPrice || 0).toString(),
        },
      })
    );
  };

  const handleToastOpen = (status: 'add' | 'remove') => {
    setToastStatus(status);
    setToastOpen(true);
  };

  const handleLikeToggle = async () => {
    if (isLoading || !variantId) return;
    setToggleLoading(true);
    try {
      if (liked) {
        await dispatch(deleteWishlist.initiate(variantId.toString()));
        handleToastOpen('remove');
      } else {
        await dispatch(addWishlist.initiate(variantId.toString()));
        handleToastOpen('add');
        handleTrackAddToWishlist();
      }
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <>
      <RadioGroup
        value={liked ? 'liked' : ''}
        name="product-like"
        orientation="horizontal"
        aria-label="Add to wishlist"
        title="Add to wishlist"
        onClick={handleLikeToggle}
        sx={{
          position: 'relative',
          ...(isLoading && {
            '& .MuiSvgIcon-root': {
              opacity: 0,
            },
          }),
        }}
      >
        {/* <RadioIcon
          value="liked"
          variant="outlined"
          overlay
          uncheckedIcon={<Favorite />}
          checkedIcon={<Favorite />}
          disabled={isLoading}
        /> */}
        <Radio
          value="liked"
          overlay
          checkedIcon={
            <FavoriteFilled
              sx={{
                width: 24,
                height: 24,
                cursor: 'pointer',
              }}
            />
          }
          uncheckedIcon={
            <Favorite
              sx={{
                width: 24,
                height: 24,
                cursor: 'pointer',
              }}
            />
          }
          disabled={isLoading}
          sx={{
            '& .MuiRadio-radio': {
              border: 'none',
              width: '24px',
              height: '24px',
              span: {
                width: '24px !important',
                height: '24px !important',
              },
              '& svg': {
                color: 'var(--fortress-palette-brand-maroonVelvet-500)',
              },
              '&:hover': {
                backgroundColor: 'transparent',
              },
            },
          }}
          slotProps={{
            input: {
              'aria-label': liked ? 'Remove from wishlist' : 'Add to wishlist',
              title: liked ? 'Remove from wishlist' : 'Add to wishlist',
            },
          }}
        />
        {isLoading && (
          <CircularProgress
            size="sm"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              [`&.${circularProgressClasses.root}`]: {
                '--CircularProgress-trackColor': 'transparent',
                '--CircularProgress-progressColor': 'var(--fortress-palette-neutral-500)',
                '--CircularProgress-percent': `${75} !important`,
              },
            }}
          />
        )}
      </RadioGroup>
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        theme="dark"
        anchorOrigin={{
          vertical: desktop ? 'top' : 'bottom',
          horizontal: mobile ? 'center' : 'right',
        }}
        sx={
          {
            // width: '342px',
          }
        }
        startDecorator={<CheckCircleFilled />}
        endDecorator={
          <Close
            onClick={() => setToastOpen(false)}
            sx={{
              cursor: 'pointer',
            }}
          />
        }
        actionSlot={
          toastStatus === 'remove' ? null : (
            <CustomLink linkKey="wishlist">
              <Typography
                level="body1"
                sx={{
                  color: 'var(--fortress-palette-brand-warmLinen-500)',
                  textDecoration: 'underline',
                }}
              >
                View Wishlist
              </Typography>
            </CustomLink>
          )
        }
      >
        <Typography
          level="body1"
          sx={(theme) => ({
            color: theme.palette.brand.warmLinen[500],
          })}
        >
          {toastStatus === 'remove' ? 'Removed from wishlist!' : 'Added to wishlist!'}
        </Typography>
      </Toast>
    </>
  );
};
