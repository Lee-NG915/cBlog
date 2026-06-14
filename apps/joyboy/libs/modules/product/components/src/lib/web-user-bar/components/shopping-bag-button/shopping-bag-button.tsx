'use client';
import { useMemo, useState, useEffect } from 'react';
import { Badge, IconButton } from '@castlery/fortress';
import { ShoppingBag } from '@castlery/fortress/Icons';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder, selectOrderLoading, selectWebMergeOrderLoading } from '@castlery/modules-order-domain';
import LinkButton from '../link-button/link-button';
import { EcEnv } from '@castlery/config';
import { selectCartItemsCount, selectReloadCartLoading, selectInitialCartLoading } from '@castlery/modules-cart-domain';
import { sharedFeatureService } from '@castlery/shared-services';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { selectedIsLoggedIn } from '@castlery/modules-user-domain';

interface ShoppingBagButtonProps {
  onClick?: () => void;
}

const ShoppingBagButtonV1 = ({ onClick }: ShoppingBagButtonProps) => {
  const currentOrderData = useAppSelector(selectOrder);
  const orderLoadingStatus = useAppSelector(selectOrderLoading);
  const orderMergeLoadingStatus = useAppSelector(selectWebMergeOrderLoading);
  const persistenceHandles = useMemo(() => makePersistenceHandles(), []);
  const hasWebOrderNumber = persistenceHandles.webOrderId.hasItem();
  const isLoggedIn = useAppSelector(selectedIsLoggedIn);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isBadgeLoading = !isMounted
    ? true
    : !isLoggedIn
    ? !!hasWebOrderNumber && !!orderLoadingStatus
    : currentOrderData === null || orderLoadingStatus || orderMergeLoadingStatus;

  const cartItemNums = useMemo(() => {
    return currentOrderData?.line_items
      ? currentOrderData.line_items.reduce((accumulator, current) => {
          return accumulator + current?.quantity;
        }, 0)
      : 0;
  }, [currentOrderData?.line_items]);

  return (
    <IconButton
      size="md"
      component={LinkButton}
      path={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`}
      menu-type="user_menu"
      text="Account"
      onClick={onClick}
      sx={{
        padding: '0 !important',
      }}
    >
      <Badge loading={isBadgeLoading} badgeContent={cartItemNums}>
        <ShoppingBag
          sx={(theme) => ({
            width: theme.spacing(6),
            height: theme.spacing(6),
            fill: theme.palette.brand.mono[900],
          })}
        />
      </Badge>
    </IconButton>
  );
};

export const ShoppingBagButtonV2 = ({ onClick }: ShoppingBagButtonProps) => {
  const initialCartLoading = useAppSelector(selectInitialCartLoading);
  const cartLoading = useAppSelector(selectReloadCartLoading);
  const cartItemNum = useAppSelector(selectCartItemsCount);
  const cartPath = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/cart`;

  return (
    <IconButton size="md" component={LinkButton} path={cartPath} menu-type="user_menu" text="Account" onClick={onClick}>
      <Badge loading={cartLoading || initialCartLoading} badgeContent={cartItemNum ?? null}>
        <ShoppingBag
          sx={(theme) => ({
            width: theme.spacing(6),
            height: theme.spacing(6),
            fill: theme.palette.brand.mono[900],
          })}
        />
      </Badge>
    </IconButton>
  );
};

const ShoppingBagButton = sharedFeatureService.enabledOrderV2 ? ShoppingBagButtonV2 : ShoppingBagButtonV1;

export { ShoppingBagButton };
