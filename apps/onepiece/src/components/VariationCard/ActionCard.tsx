/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @description This component is used to display product variation action card
 * @design (wishlist product) https://www.figma.com/file/cVvE6trbKfsBcmWOoelMPi/Fortress%3A-Components?type=design&node-id=2-81&mode=design&t=OIRs8IGacUdNH0bY-0
 */

import {
  Card,
  CardActions,
  CardContent,
  CardOverflow,
  Typography,
  Button,
  IconButton,
  Box,
  Stack,
  CircularProgress,
} from '@castlery/fortress';
import { FavoriteFilled, AddShoppingBag, Favorite, Check } from '@castlery/fortress/Icons';
import React, { useMemo, useState } from 'react';
import Tag from 'components/Tag';
import ReactPicture from 'components/ReactPicture';
import StrikeoffPrice from 'components/StrikeoffPrice';
import { toPrice } from 'utils/number';
import type { ActionCardProps } from './props';

const ActionCard: React.FC<ActionCardProps> = ({
  cardSx,
  variant,
  cartData,
  loading,
  handleAddToCart,
  handleRemoveWishlist,
  handleClick,
}) => {
  const productOptions = useMemo(() => {
    if (variant.product_type === 'bundle') {
      if (variant.product_layout !== 'bundle_overlay') {
        return variant.product_bundle_options.map((option) => option.option_product_name).join(', ');
      }
      return 'More Customizations';
    }
    return variant.variant_option_values.map((option) => option.presentation).join(', ');
  }, [variant]);

  const hasAddToCart = useMemo(() => {
    if (cartData && variant) {
      return cartData?.line_items?.some((item) => item.variant?.sku === variant.sku);
    }
    return false;
  }, [cartData, variant]);

  const showStrikeoffPrice = +variant.price !== +variant.list_price;
  const price = toPrice(variant.price, true);
  const strikeoffPrice = toPrice(variant.list_price, true);

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    // TODO Temporary processing of bundle product
    if (variant?.product_type === 'bundle') {
      if (handleClick) {
        handleClick(variant);
      }
    } else if (handleAddToCart) {
      handleAddToCart(variant, hasAddToCart);
    }
  };

  const handleRemoveWishlistClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (handleRemoveWishlist) {
      handleRemoveWishlist(variant);
    }
  };

  return (
    <Card
      variant="plain"
      sx={{
        ...cardSx,
        '&:hover': {
          cursor: 'pointer',
          '.Product-title': {
            color: (theme) => theme.palette.primary[500],
          },
        },
      }}
      onClick={() => {
        if (handleClick) {
          handleClick(variant);
        }
      }}
    >
      {/* Card image */}
      <CardOverflow sx={{}}>
        {variant.images.length > 0 ? (
          <ReactPicture
            {...({
              srcset: variant.images[0].links,
              alt: variant.product_name,
              loader: { ratio: 0.66, sizes: ['0.25-xsl', '0.34-xl', '0.5-sm'] },
              lazy: true,
            } as any)}
          />
        ) : (
          <ReactPicture
            {...({
              alt: variant.product_name,
              loader: { ratio: 0.66 },
            } as any)}
          />
        )}
      </CardOverflow>

      {/* Card content */}
      <CardContent
        sx={{
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography level="body1" className="Product-title">
          {variant.product_name} <Tag tags={variant?.badges || []} />
        </Typography>
        <Stack flexGrow="1" direction="column" alignItems="center" justifyContent="space-around">
          <Typography level="caption1" textColor="brand.charcoal.500">
            {productOptions}
          </Typography>
          <StrikeoffPrice
            price={price}
            strikeoffPrice={strikeoffPrice}
            showStrikeoffPrice={showStrikeoffPrice}
            priceProps={{
              textColor: showStrikeoffPrice ? 'primary' : 'brand.charcoal.800',
            }}
          />
        </Stack>
      </CardContent>

      {/* Card actions */}
      <CardActions buttonFlex="1 1 100px">
        <Button loading={loading} variant="secondary" color="neutral" onClick={handleAddToCartClick}>
          <Box
            display={{
              xs: 'none',
              sm: 'block',
            }}
          >
            {/* TODO Temporary processing of bundle product */}
            {hasAddToCart ? <Check /> : variant?.product_type === 'bundle' ? 'View Details' : 'Add to Cart'}
          </Box>
          <Box
            display={{
              xs: 'block',
              sm: 'none',
            }}
          >
            {hasAddToCart ? <Check /> : <AddShoppingBag />}
          </Box>
        </Button>
        <IconButton variant="outlined" color="neutral" onClick={handleRemoveWishlistClick}>
          {!loading ? <FavoriteFilled color="primary" /> : <CircularProgress size="sm" thickness={3} />}
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ActionCard;
