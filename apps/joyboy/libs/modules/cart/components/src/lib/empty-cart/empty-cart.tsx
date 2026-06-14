'use client';
import { Typography, Stack, useBreakpoints, typographyClasses } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { WebContinueShopping } from '../web-continue-shopping/web-continue-shopping';
import { useMemo } from 'react';

/**
 * checklist:
 * 1. add continue shopping button function ,maybe <a> tag
 * 2. responsive ui styles, desktop, tablet, mobile : done
 * @returns
 */
export function EmptyCart() {
  const { desktop, tablet, mobile } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'emptyCart' });

  const isInMiniCart = useAppSelector(selectMiniCartMode);

  const { wrapperStyle, titleStyle, descStyle } = useMemo(() => {
    const wrapperStyle = {
      backgroundColor: (theme: any) => theme.palette.brand.warmLinen[200],
      ...(mobile && {
        py: 6,
        px: 4,
      }),
      ...(tablet && {
        py: 8,
        px: 6,
        '& button,a': {
          maxWidth: 240,
        },
      }),
      ...(desktop && {
        px: 8,
        py: 8,
        '& button,a': {
          width: 240,
        },
      }),
      ...(isInMiniCart && {
        px: 0,
        py: 0,
        gap: 8,
        '& button,a': {
          width: mobile ? 'calc(100vw - 48px)' : 448,
          margin: '0 auto',
        },
      }),
    };

    const titleStyle = isInMiniCart
      ? {
          p: 6,
        }
      : {
          ...(desktop && {
            mb: 2,
          }),
        };

    const descStyle = isInMiniCart
      ? {
          mt: 8,
          textAlign: 'center',
        }
      : {
          mb: desktop ? 8 : 6,
        };

    return {
      wrapperStyle,
      titleStyle,
      descStyle,
    };
  }, [desktop, tablet, mobile, isInMiniCart]);

  return (
    <Stack
      sx={{
        [`& .${typographyClasses.root}`]: {
          color: (theme) => theme.palette.brand.maroonVelvet[500],
        },
        ...wrapperStyle,
      }}
    >
      {!isInMiniCart && (
        <Typography level="h1" sx={titleStyle}>
          {t('title')}
        </Typography>
      )}
      <Typography level="body1" sx={descStyle}>
        {t('emptyDesc')}
      </Typography>

      <WebContinueShopping asButton />
    </Stack>
  );
}

export default EmptyCart;
