'use client';

import { Button } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectMiniCartMode, updateMiniCartMode } from '@castlery/modules-cart-domain';
import { basePageConfig, EcEnv } from '@castlery/config';

interface WebContinueShoppingProps {
  asButton?: boolean;
}
export function WebContinueShopping({ asButton = false }: WebContinueShoppingProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'webCheckoutButton' });

  const inMiniCart = useAppSelector(selectMiniCartMode);

  const homeUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY}${basePageConfig.home}`.toLowerCase();

  const handleClick = () => {
    if (inMiniCart) {
      dispatch(updateMiniCartMode(false));
    }
  };

  if (asButton) {
    if (inMiniCart) {
      return (
        <Button onClick={handleClick} sx={{ maxWidth: 518 }}>
          {t('continueShopping')}
        </Button>
      );
    }
    return (
      <Button component="a" href={homeUrl} sx={{ maxWidth: 518 }}>
        {t('continueShopping')}
      </Button>
    );
  }

  return (
    <Button variant="plain" onClick={handleClick} sx={{ width: '100%', maxWidth: 518 }}>
      {t('continueShopping')}
    </Button>
  );
}
