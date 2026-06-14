import { IconButton, Button, Box, Typography, Link } from '@castlery/fortress';
import { useCallback } from 'react';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder } from '@castlery/modules-order-domain';
import { AddShoppingBag, Check } from '@castlery/fortress/Icons';
import { toPrice } from '@castlery/utils'; //util
//eslint-disable-next-line
import { FortressImage, CustomLink } from '@castlery/shared-components';
import type { Gift as GiftType } from '@castlery/types';
// import { dt, EventsNames } from '@castlery/data-tracking-events';

interface GiftProps {
  gift: GiftType;
  mobileLayout?: boolean;
  lazy?: boolean;
  posSlectDeliveryModal?: (gift: GiftType) => void;
  isCouponModule?: boolean;
}

const Gift = ({ gift, mobileLayout = false, lazy = true, posSlectDeliveryModal, isCouponModule }: GiftProps) => {
  const order = useAppSelector(selectOrder);
  const variant = gift.variant;
  const giftPoolId = gift.gift_pool_id;

  const handleChooseGift = useCallback(async () => {
    // pos 中选择礼物需要选择配送方式
    if (posSlectDeliveryModal) {
      posSlectDeliveryModal?.(gift);
      return;
    }
  }, [gift, posSlectDeliveryModal]);

  const currentOrderGifts = order?.line_items?.filter((lineItem) => !!lineItem.gift_id) || [];
  const isChosen = currentOrderGifts.find(
    (lineItem) => lineItem.gift_id === giftPoolId && lineItem.variant.id === gift.variant.id
  );

  const isOutOfStock = gift?.state === 'OUT_OF_STOCK';
  const isUnavailable = gift?.state === 'UNAVAILABLE';
  const isInStock = gift?.state === 'IN_STOCK';
  const isDisabled = !!isChosen || isOutOfStock || isUnavailable || !isInStock;

  // 变体相关逻辑
  const productLink = `${variant.product_slug}`;
  const displayPrice = !isNaN(+variant.price) && +variant.price !== +variant.list_price;

  const modalGiftButtonStyle = {
    width: '100%',
    height: '52px',
    boxShadow: 'none',
    color: '#877445',
    '& svg': {
      color: '#877445',
    },
  };

  const buttonStyle = {
    '--IconButton-size': '32px',
    minWidth: '32px',
    minHeight: '32px',
    width: isCouponModule ? '100%' : '32px',
    height: '32px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '50%',
    border: `1px solid var(--fortress-palette-brand-wheat-700)`,
    background: 'var(--fortress-palette-brand-charcoal-0)',
    boxShadow: '0px 4px 8px 1px rgba(0, 0, 0, 0.15)',
    '& svg': {
      width: '20px',
      height: '20px',
      fill: 'var(--fortress-palette-brand-wheat-700)',
    },
  };
  // 添加到购物车按钮
  const AddToCartButton = () => {
    if (isUnavailable || isOutOfStock) {
      return (
        <Button
          variant="plain"
          disabled
          size="sm"
          sx={{
            background: '#E9E9E9',
            ...(isCouponModule
              ? {
                  ...modalGiftButtonStyle,
                  width: '100%',
                  span: {
                    fontSize: '16px',
                  },
                }
              : {
                  '--Button-minHeight': '25px',
                  '--Button-radius': '4px',
                  width: isOutOfStock ? '110px' : '88px',
                  height: '25px',
                  borderRadius: '4px',
                }),
          }}
        >
          <Typography
            level="caption2"
            sx={{
              color: (theme) => theme.palette.brand.charcoal[400],
            }}
          >
            {isUnavailable ? 'Unavailable' : 'Out of Stock'}
          </Typography>
        </Button>
      );
    }

    if (isChosen) {
      return (
        <IconButton
          variant="plain"
          data-selenium="free-gift-modal-button"
          disabled
          sx={{
            ...buttonStyle,
            '&:disabled': {
              background: 'var(--fortress-palette-brand-chai-300)',
              boxShadow: '0px 4px 8px 1px rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--fortress-palette-brand-wheat-500)',
            },
          }}
        >
          <Check />
        </IconButton>
      );
    }

    return (
      <IconButton
        variant="outlined"
        data-selenium="free-gift-modal-button"
        disabled={isDisabled}
        onClick={handleChooseGift}
        color="neutral"
        sx={{
          ...(isCouponModule ? modalGiftButtonStyle : buttonStyle),
        }}
      >
        {isCouponModule ? (
          <Typography
            level="body2"
            sx={{
              color: (theme) => theme.palette.brand.wheat[700],
            }}
          >
            Add to Cart
          </Typography>
        ) : (
          <AddShoppingBag />
        )}
      </IconButton>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'center',
        gap: 1,
        width: mobileLayout ? '120px' : '200px',
        flexShrink: 0,
        flex: '0 0 auto',
      }}
    >
      {/* 商品图片 */}
      <CustomLink href={productLink}>
        <Box>
          {variant.images?.length > 0 ? (
            <FortressImage
              sx={{
                width: '100%',
                height: mobileLayout ? '81px' : '135px',
              }}
              src={variant.images[0].links.feed}
              alt={variant.product_name}
              lazy={lazy}
            />
          ) : (
            <FortressImage alt={variant.product_name} src={''} />
          )}
        </Box>
      </CustomLink>

      {/* 商品名称 */}
      <Link
        sx={{
          textDecoration: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '&:hover': {
            textDecoration: 'none',
            color: 'red',
          },
        }}
        href={productLink}
      >
        <Typography
          level="caption1"
          textAlign="center"
          sx={{
            color: !isInStock
              ? (theme) => theme.palette.brand.charcoal[400]
              : (theme) => theme.palette.brand.charcoal[800],
            '&:hover': {
              textDecoration: 'none',
              color: '#a45b37',
            },
          }}
        >
          {variant.product_name}
        </Typography>
      </Link>
      <Box
        sx={{
          mt: -1,
        }}
      >
        {variant.variant_option_values &&
          variant.variant_option_values.map((v) => (
            <Typography
              level="caption1"
              key={v.option_value_id}
              textAlign="center"
              sx={{
                color: !isInStock
                  ? (theme) => theme.palette.brand.charcoal[400]
                  : (theme) => theme.palette.brand.wheat[500],
              }}
            >
              {v.option_type_presentation}: {v.presentation}
            </Typography>
          ))}
      </Box>

      {/* 价格展示 */}
      <Box>
        {displayPrice ? (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              level="caption1"
              textAlign="center"
              sx={{
                color: (theme) => theme.palette.brand.terracotta[500],
              }}
              aria-label={`Sale Price: ${toPrice(+variant.price, true)}`}
            >
              {toPrice(+variant.price, true)}
            </Typography>
            <Typography
              level="caption1"
              textAlign="center"
              sx={{
                color: (theme) => theme.palette.brand.charcoal[500],
                textDecoration: 'line-through',
              }}
              aria-label={`Regular Price: ${toPrice(+variant.list_price, true)}`}
            >
              {toPrice(+variant.list_price, true)}
            </Typography>
          </Box>
        ) : (
          <Typography
            level="caption1"
            textAlign="center"
            sx={{
              color: (theme) => theme.palette.brand.charcoal[800],
            }}
            aria-label={`Price: ${toPrice(+variant.price, true)}`}
          >
            {toPrice(+variant.price, true)}
          </Typography>
        )}
      </Box>

      {/* 添加到购物车按钮 */}
      <Box sx={{ mb: 1, mx: isCouponModule ? 'none' : 'auto', mt: isCouponModule ? 'auto' : 'none' }}>
        <AddToCartButton />
      </Box>
    </Box>
  );
};

export default Gift;
