'use client';
import { Box, Typography, IconButton, Link, useBreakpoints, Tag, typographyClasses } from '@castlery/fortress';
import { useMemo, useState, useCallback } from 'react';
import { AddShoppingBag, Check, ShoppingBag } from '@castlery/fortress/Icons';
import { toPrice } from '@castlery/utils';
// @ts-ignore
import { FortressImage, CustomLink, useLineItemLink } from '@castlery/shared-components';
import type { GiftPoolGiftItemWithVariantSchema } from '@castlery/types';
import { GiftState } from '@castlery/types';

interface GiftItemProps {
  gift: GiftPoolGiftItemWithVariantSchema;
  onAddToCart?: (gift: GiftPoolGiftItemWithVariantSchema) => void | Promise<void>;
  loading?: boolean;
  /** true → use variant.originalPrice as strike-through; false → use variant.price */
  useOriginalPrice?: boolean;
}

/**
 * 优惠券礼品卡片组件
 * 用于展示可选择的免费礼品
 */
export const GiftItem = ({ gift, onAddToCart, loading = false, useOriginalPrice = false }: GiftItemProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const { mobile } = useBreakpoints();
  const productLink = useLineItemLink(gift as any);
  const variant = gift.variant || {};
  // const productLink = variant.productSlug;
  const isChosen = gift.selected;

  // 库存状态判断
  // @ts-ignore - gift.state 可能在运行时具有 GiftState 枚举值
  const giftState = gift.state as unknown as GiftState;
  const isOutOfStock = giftState === GiftState.OUT_OF_STOCK;
  const isUnavailable = giftState === GiftState.UNAVAILABLE;
  const isInStock = giftState === GiftState.IN_STOCK;
  const isDisabled = isOutOfStock || isUnavailable || !isInStock || loading;

  const strikeThroughPrice = useOriginalPrice ? variant.originalPrice : variant.price;
  const showStrikeThroughPrice = Number(variant.price) !== 0;

  // 处理添加到购物车
  const handleAddToCart = useCallback(async () => {
    if (isDisabled || isChosen || isAdding || !onAddToCart) return;

    setIsAdding(true);
    try {
      await onAddToCart(gift);
    } finally {
      setIsAdding(false);
    }
  }, [gift, onAddToCart, isDisabled, isAdding]);

  // 按钮样式
  const buttonStyle = useMemo(
    () => ({
      '--IconButton-size': '40px',
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: '1px solid',
      borderColor: isChosen ? 'brand.maroonVelvet.500' : 'brand.mono.300',
      bgcolor: isChosen ? 'brand.maroonVelvet.500' : 'transparent',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease-in-out',
      '& svg': {
        width: 24,
        height: 24,
        color: isChosen ? (theme) => theme.palette.brand.warmLinen[500] : (theme) => theme.palette.brand.mono[900],
      },
      '&:hover': {
        '& svg': {
          color: (theme) => theme.palette.brand.warmLinen[600],
        },
      },
      '&:disabled': {
        bgcolor: (theme) => theme.palette.brand.mono[200],
        borderColor: (theme) => theme.palette.brand.mono[300],
        opacity: 0.5,
      },
    }),
    [isChosen]
  );

  // 渲染变体选项值（如颜色、尺寸等）
  const renderVariantOptions = useMemo(() => {
    if (!variant.variantOptionValues || variant.variantOptionValues.length === 0) return null;

    const optionsText = variant.variantOptionValues
      .map((option: { presentation: string; optionValueId: string }) => option.presentation)
      .join(', ');

    return (
      <Typography
        level="caption1"
        sx={{
          color: (theme) => theme.palette.brand.maroonVelvet[300],
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {optionsText}
      </Typography>
    );
  }, [variant.variantOptionValues]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 200,
        display: 'flex',
        flexDirection: 'column',
        [`& .${typographyClasses.root}`]: {
          color: isDisabled ? (theme) => `${theme.palette.brand.mono[500]}` : '',
        },
      }}
    >
      {/* 产品图片 */}
      <CustomLink href={productLink}>
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
            transition: 'transform 0.2s ease-in-out',
            mb: 2,
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
        >
          <FortressImage
            sx={{
              width: mobile ? 142 : 200,
              height: mobile ? 81 : 135,
              objectFit: 'cover',
            }}
            src={variant.images?.[0]?.links.feed ?? ''}
            alt={variant.productName}
            lazy={true}
          />
        </Box>
      </CustomLink>

      {/* 产品信息 */}
      <Box sx={{ width: '100%' }}>
        {/* 产品名称 */}
        <Link
          href={productLink}
          sx={{
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'none',
            },
          }}
        >
          <Typography
            level="h5"
            sx={{
              mb: 1,
              color: (theme) => theme.palette.brand.maroonVelvet[700],
            }}
          >
            {variant.productName}
          </Typography>
        </Link>

        {/* 变体选项（颜色、尺寸等）*/}
        {renderVariantOptions}

        {/* 价格展示 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            mt: 3,
          }}
        >
          <Typography level="h5" aria-label="Free gift">
            Free
          </Typography>
          {showStrikeThroughPrice && (
            <Typography
              level="h5"
              sx={{
                color: (theme) => theme.palette.brand.mono[500],
                textDecoration: 'line-through',
                fontWeight: 400,
              }}
              aria-label={`Original price: ${toPrice(+strikeThroughPrice, true)}`}
            >
              {toPrice(+strikeThroughPrice, true)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* 添加到购物车按钮 / 缺货或不可用提示 */}
      <Box sx={{ mt: 5 }}>
        {isOutOfStock || isUnavailable ? (
          <Tag variant="outlined">
            <Typography level="caption2" sx={{ color: (theme) => `${theme.palette.brand.terracotta[500]} !important` }}>
              {isOutOfStock ? 'Out of Stock' : 'Unavailable'}
            </Typography>
          </Tag>
        ) : (
          <IconButton
            variant="outlined"
            disabled={!isChosen && isDisabled}
            loading={isAdding || loading}
            onClick={handleAddToCart}
            aria-label={isChosen ? 'Gift added' : 'Add gift to cart'}
            sx={buttonStyle}
          >
            {isChosen ? <Check /> : <ShoppingBag />}
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default GiftItem;
