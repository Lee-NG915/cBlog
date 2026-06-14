'use client';
import * as React from 'react';
import { Box, Stack, Typography, IconButton, Drawer, ModalClose, Modal } from '@castlery/fortress';
import { DynamicModalDialog, DynamicDialogTitle } from '@castlery/shared-fortress-client';
import { selectCartItems } from '@castlery/modules-order-domain';
import type { ModalDialogProps } from '@castlery/fortress';
import { Connect, Menu, ResetTV, ShoppingCart } from '@castlery/fortress/Icons';
import { selectedRetailId, useGetRetailByIdQuery } from '@castlery/modules-retails-domain';
import { PosMenu } from '@castlery/modules-user-components';
import { selectedAdminUserName, selectedPage, selectedPosUmsUserName } from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { ConnectReader } from '@castlery/modules-product-components';
import { usePathname, useRouter } from 'next/navigation';
import { posRoutes } from '@castlery/config';
import { createANewPosOrder } from '@castlery/modules-order-services';
import {
  clearReader,
  currentHadConnectedReader,
  updateConnectionStatus,
  updatePaymentStatus,
  useLazyGeneratePosQuery,
} from '@castlery/modules-product-domain';
import { BackBtn } from '@castlery/shared-components';
import { PosCart } from '../pos-cart/pos-cart';
import { useMemo } from 'react';
import Script from 'next/script';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { PosCartSection } from '../pos-cart-section/pos-cart-section';
import { clearPosCartCommand } from '@castlery/modules-cart-services';
import { sharedFeatureService } from '@castlery/shared-services';
import { PosCheckoutSection } from '../pos-checkout-section/pos-checkout-section';
import { handlersMap } from '@castlery/modules-composite-services';
import { logger } from '@castlery/observability/client';

const enableOrderV2 = !!sharedFeatureService.enabledOrderV2;
const enablePosUmsAuth = !!sharedFeatureService.enabledPosUmsAuth;

// TODO https://mui.com/joy-ui/react-modal/#modal-overflow 封装一个 drawer 和 model
export function PosDrawer() {
  const [open, setOpen] = React.useState(false);
  // const { xs } = useBreakpoints();

  const toggleDrawer = (inOpen: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setOpen(inOpen);
  };

  return (
    <>
      <IconButton onClick={toggleDrawer(true)} aria-expanded={open} aria-label="open drawer" aria-haspopup="true">
        <Menu sx={{ fill: 'var(--fortress-palette-neutral-500)' }} />
      </IconButton>
      <Drawer
        showCloseButton
        anchor={'left'}
        // anchor={xs ? 'bottom' : 'left'}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Box
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
          sx={{
            display: 'flex',
          }}
        >
          <PosMenu />
        </Box>
      </Drawer>
    </>
  );
}

function CartModel({ isInCheckoutPage, itemsTotalNum }: { isInCheckoutPage: boolean; itemsTotalNum: number }) {
  const [layout, setLayout] = React.useState<ModalDialogProps['layout'] | undefined>(undefined);
  return (
    <Box
      sx={{
        display: {
          xs: 'block',
          md: 'none',
          maxHeight: 24,
        },
      }}
    >
      <IconButton
        aria-label="Cart"
        onClick={() => {
          setLayout('fullscreen');
        }}
        sx={{
          minWidth: 24,
          minHeight: 24,
          padding: 0,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: 24,
            height: 24,
          }}
        >
          <ShoppingCart
            sx={{
              width: 24,
              height: 24,
              fill: 'var(--fortress-palette-neutral-500)',
            }}
          />
          {itemsTotalNum > 0 && (
            <Box
              sx={{
                position: 'absolute',
                width: '16px',
                height: '16px',
                top: '-8px',
                right: '-10px',
                borderRadius: '50%',
                border: '1px solid var(--fortress-palette-neutral-500)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  textAlign: 'center',
                }}
              >
                {itemsTotalNum}
              </Typography>
            </Box>
          )}
        </Box>
      </IconButton>
      <Modal open={!!layout} onClose={() => setLayout(undefined)}>
        <DynamicModalDialog layout={layout}>
          <DynamicDialogTitle>Cart</DynamicDialogTitle>
          <ModalClose variant="plain" />
          {enableOrderV2 ? isInCheckoutPage ? <PosCheckoutSection /> : <PosCartSection /> : <PosCart />}
        </DynamicModalDialog>
      </Modal>
    </Box>
  );
}

export const NewOrderBtn = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const handleCreateNewOrderClick = async () => {
    try {
      setLoading(true);
      if (enableOrderV2) {
        await dispatch(clearPosCartCommand());
      } else {
        await dispatch(createANewPosOrder());
      }
      setTimeout(async () => {
        setLoading(false);
      }, 2000);
      await router.replace(posRoutes.products);
      window.location.reload();
    } catch (error) {
      logger.error('Failed to create new POS order', {
        error: error instanceof Error ? error.message : String(error),
        context: 'pos_new_order',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      loading={loading}
      aria-label="New Order"
      onClick={handleCreateNewOrderClick}
      sx={{
        minWidth: 24,
        minHeight: 24,
        padding: 0,
        marginRight: 2,
      }}
    >
      <ResetTV
        sx={{
          width: 24,
          height: 24,
          fill: 'var(--fortress-palette-neutral-500)',
        }}
      />
    </IconButton>
  );
};

export function PosSiteHeader() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isInCheckoutPage = pathname.includes('checkout');
  const retailId = useAppSelector(selectedRetailId);
  const [generatePosQuery] = useLazyGeneratePosQuery();
  const legacyName = useAppSelector(selectedAdminUserName);
  const umsName = useAppSelector(selectedPosUmsUserName);
  const name = enablePosUmsAuth && umsName ? umsName : legacyName;
  // const userInfo = useAppSelector(selectedAdminUserInfo);
  const { currentData: currentRetail } = useGetRetailByIdQuery(retailId!, {
    skip: !retailId,
  });
  // const { currentData: currentUser } = useGetCurrentUserQuery();
  const [readerOpen, setReaderOpen] = React.useState(false);
  const readerConnected = useAppSelector(currentHadConnectedReader);
  const [stripehasInit, setStripehasInit] = React.useState(false);
  const cartItems = useAppSelector(selectCartItems);
  const pageName = useAppSelector(selectedPage);
  const { readerInfo } = makePersistenceHandles();
  const cartItemsTotalNum = useMemo(() => {
    let total = 0;
    cartItems.forEach((item: { quantity: number }) => {
      total += item.quantity;
    });
    return total;
  }, [cartItems]);
  const handleScannerClick = () => {
    setReaderOpen(true);
  };

  const onFetchConnectionToken = () => {
    // @ts-ignore
    return generatePosQuery()
      .then((res) => {
        if (res?.data?.secret) {
          return res.data.secret;
        } else {
          logger.error('Failed to fetch Stripe connection token', {
            hasResponse: !!res,
            context: 'pos_stripe_terminal',
          });
          throw new Error('Connection token fetch failed');
        }
      })
      .catch((error) => {
        logger.error('Error fetching Stripe connection token', {
          error: error instanceof Error ? error.message : String(error),
          context: 'pos_stripe_terminal',
        });
        throw error;
      });
  };
  const onUnexpectedReaderDisconnect = async () => {
    logger.warn('Stripe reader unexpectedly disconnected', {
      context: 'pos_stripe_terminal',
    });
    dispatch(clearReader());
    await readerInfo.removeItem();
  };
  const onConnectionStatusChange = (statusArgs: { status: string }) => {
    const { status } = statusArgs;
    logger.info('Stripe reader connection status changed', {
      status,
      context: 'pos_stripe_terminal',
    });
    if (status === 'not_connected') {
      dispatch(clearReader());
    }
    dispatch(updateConnectionStatus(status));
  };

  const onPaymentStatusChange = ({ status }: { status: string }) => {
    logger.info('Stripe payment status changed', {
      status,
      context: 'pos_stripe_terminal',
    });
    if (status === 'not_connected') {
      dispatch(clearReader());
    }
    dispatch(updatePaymentStatus(status));
  };

  const showroomList = ['Castlery Sydney Showroom', 'Castlery Brisbane Studio (Fortitude Valley)'];

  const renderRetailName = () => {
    if (showroomList.includes(currentRetail?.name)) {
      return 'Showroom';
    }
    return currentRetail?.name;
  };

  return (
    <>
      <Script
        src="https://js.stripe.com/terminal/v1/"
        id="stripe-terminal"
        onReady={() => {
          // TODO: use stripe npm package
          // https://docs.stripe.com/terminal/payments/setup-integration?terminal-sdk-platform=js#install
          if (!window.terminal) {
            window.terminal = window?.StripeTerminal?.create({
              onFetchConnectionToken: onFetchConnectionToken,
              onUnexpectedReaderDisconnect: onUnexpectedReaderDisconnect,
              onConnectionStatusChange: onConnectionStatusChange,
              onPaymentStatusChange: onPaymentStatusChange,
            });
            setStripehasInit(true);
          }
        }}
        onError={(error) => {
          logger.error('Failed to load Stripe Terminal script', {
            error: error instanceof Error ? error.message : String(error),
            context: 'pos_stripe_terminal',
          });
        }}
      />
      <Box
        sx={(theme) => ({
          position: 'relative',
          display: 'flex',
          flexGrow: 1,
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'var(--fortress-palette-brand-warmLinen-500)',
          py: 2,
          px: 4,
          height: 62,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        })}
      >
        {isInCheckoutPage ? (
          <BackBtn
            icon
            afterClick={({ pathname, router, searchparams, params }) => {
              const nextUrl = pathname.replace('/checkout', '/products');
              router.replace(nextUrl);
              handlersMap.reloadCartData(dispatch);
              // window.location.reload();
              // router.refresh();
            }}
          />
        ) : (
          <PosDrawer />
        )}
        {pageName === 'SALES HISTORY' ? (
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
            }}
          >
            <Typography level="subh2">{pageName}</Typography>
          </Stack>
        ) : (
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
            }}
          >
            <Typography level="subh2">{renderRetailName()}</Typography>
            <Typography level="body2" sx={{ textTransform: 'capitalize' }}>
              {name}
            </Typography>
          </Stack>
        )}
        {pageName === 'SALES HISTORY' ? (
          <Typography level="subh2" sx={{ fontSize: '0.8rem', textTransform: 'none' }}>
            {name.split(' ')[0]}
          </Typography>
        ) : (
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ display: 'flex' }}>
            <IconButton
              aria-label="Connect Reader"
              onClick={handleScannerClick}
              sx={{
                minWidth: 24,
                minHeight: 24,
                padding: 0,
                marginRight: 2,
              }}
            >
              <Connect
                sx={{
                  width: 24,
                  height: 24,
                  fill: 'var(--fortress-palette-neutral-500)',
                }}
              />
              {readerConnected && (
                <Box
                  sx={{
                    backgroundColor: 'var(--fortress-palette-success-500)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    marginBottom: '20px',
                  }}
                ></Box>
              )}
            </IconButton>
            {!isInCheckoutPage && <NewOrderBtn />}
            <CartModel isInCheckoutPage={isInCheckoutPage} itemsTotalNum={cartItemsTotalNum} />
          </Stack>
        )}
        <ConnectReader
          open={readerOpen}
          onClose={() => {
            setReaderOpen(false);
          }}
          stripehasInit={stripehasInit}
        />
      </Box>
    </>
  );
}
