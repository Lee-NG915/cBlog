import {
  Modal,
  Sheet,
  Typography,
  Button,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
} from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectOrder, selectOrderLoading } from '@castlery/modules-order-domain';
import { selectedRetailId, useGetStockLocationsByRetailIdQuery } from '@castlery/modules-retails-domain';
import { addGiftsByOrderNumberV2, getGiftsByOrderNumberSilent } from '@castlery/modules-promotion-domain';
import { dt, EventsNames } from '@castlery/data-tracking-events';
import type { Gift } from '@castlery/types';
import { logger } from '@castlery/observability/client';

export interface PosChooseFreeGiftDeliveryModalProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  gift?: Gift | null;
  code?: string;
}

export const PosChooseFreeGiftDeliveryModal = ({ open, onClose, gift, code }: PosChooseFreeGiftDeliveryModalProps) => {
  const promotionId = gift?.promotionId;
  const _controlType = gift?.controlType;
  const order = useAppSelector(selectOrder);
  const dispatch = useAppDispatch();
  const retailId = useAppSelector(selectedRetailId);
  const [loading, setLoading] = useState(false);
  const [deliveryMethodList, setDeliveryMethodList] = useState(['Delivery']);
  const [inStock, setInStock] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const orderLoading = useAppSelector(selectOrderLoading);
  const [confirmText, setConfirmText] = useState('');

  const { currentData: stockLocations, isLoading: _isLoading } = useGetStockLocationsByRetailIdQuery(
    retailId as number,
    {
      skip: !retailId,
    }
  );

  // 库存校验函数
  const verifyStockState = async (locaitonStr = '') => {
    if (!order?.number || loading) {
      return;
    }

    setLoading(true);
    setConfirmText('');
    try {
      const result = await dispatch(
        getGiftsByOrderNumberSilent.initiate({
          orderNumber: order.number,
          ...(locaitonStr && stockLocations && { stockLocationId: locaitonStr }),
          // ...(locaitonStr && haveStockLocations && stockLocations && { stockLocationId: locaitonStr }),
          ...(code && { coupon_code: code }),
        })
      );

      const curPromotion = (result.data || []).find((promotion) => promotion.promotion_id === promotionId);
      const verifyGift = curPromotion?.gifts.find(({ variant }) => variant.id === gift?.variant?.id);

      if (verifyGift?.state === 'IN_STOCK') {
        setInStock(true);
      } else {
        setConfirmText('Out of Stock');
        setInStock(false);
      }
    } catch (error) {
      setInStock(false);
      logger.error('Failed to verify gift stock', {
        error,
        giftId: gift?.gift_pool_id,
        variantId: gift?.variant?.id,
        location: locaitonStr,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && stockLocations && stockLocations.length > 0 && !initialized) {
      // 使用第一个库存位置作为默认选择（包括空字符串ID的Warehouse）
      setLocation(stockLocations[0].id);
      setDeliveryMethod(null);
      setInStock(false);
      verifyStockState(stockLocations[0].id);
      setInitialized(true);
    } else if (open && !stockLocations && !initialized) {
      setLocation('Warehouse');
      setDeliveryMethod(null);
      setInStock(false);
      verifyStockState('');
      setInitialized(true);
    }
  }, [open, stockLocations, initialized]);

  // 重置初始化状态当模态框关闭时
  useEffect(() => {
    if (!open) {
      setInitialized(false);
    }
  }, [open]);

  const giftAddToCart = useCallback(async () => {
    if (!gift) {
      return;
    }

    try {
      dt.track(EventsNames.EVENT_GWP_ADD_TO_CART_CLICK)({
        giftId: gift.variant?.id,
      });
    } catch (error) {
      // Tracking error should not block the main flow
      logger.error('Failed to track GWP add to cart event', { error, giftId: gift.variant?.id });
    }

    setLoading(true);
    const requestParams: {
      orderNumber: string;
      gift_id: string;
      variant_id: number;
      quantity: number;
      coupon_code?: string;
      options?: { preferred_self_collection: boolean; preferred_stock_location_id: string };
    } = {
      orderNumber: order?.number || '',
      gift_id: gift.gift_pool_id,
      variant_id: gift.variant?.id,
      quantity: gift?.quantity || 1,
      ...(location &&
        stockLocations && {
          options: {
            preferred_self_collection: deliveryMethod === 'Cash & Carry',
            preferred_stock_location_id: location,
          },
        }),
    };

    if (_controlType !== 1 && code) {
      requestParams.coupon_code = code;
    }

    await dispatch(addGiftsByOrderNumberV2.initiate(requestParams));

    onClose(false);
    setLoading(false);
  }, [dispatch, order, gift, onClose, _controlType, code, deliveryMethod, location]);

  // 处理 location 变化
  const handleLocationChange = (value: string) => {
    if (!open) {
      return;
    }
    setLocation(value);
    setDeliveryMethod(null);
    setInStock(false);
    verifyStockState(value);
    if (stockLocations) {
      const stockLocation = stockLocations.find((loc) => loc.id === value);
      if (stockLocation && stockLocation.support_self_collection) {
        setDeliveryMethodList(['Cash & Carry', 'Delivery']);
      } else {
        setDeliveryMethodList(['Delivery']);
      }
    }
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        '&:focus-visible': { outline: 'none' },
      }}
    >
      <Sheet
        sx={{
          width: 576,
          px: 4,
          py: 3,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box
          onClick={() => onClose(true)}
          sx={{
            position: 'absolute',
            top: 24,
            right: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
          }}
        >
          <Close sx={{ width: 24, height: 24, fill: (theme) => theme.palette.brand.wheat[500] }} />
        </Box>

        <Typography id="modal-title" level="h2" textAlign="center" sx={{ mt: 3 }}>
          Gift will be added to cart.
        </Typography>

        <Typography
          id="modal-desc"
          level="body2"
          sx={{
            textAlign: 'center',
            color: 'text.primary',
            mt: 1,
            width: '100%',
          }}
        >
          Please choose a collection or delivery method.
        </Typography>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, py: 2, mb: 3 }}>
          <FormControl required>
            <FormLabel>
              <Typography
                sx={{
                  color: (theme) => theme.palette.brand.charcoal[500],
                  marginBottom: 1,
                }}
              >
                Location
              </Typography>
            </FormLabel>
            <Select
              name="location"
              value={location}
              variant="borderplain"
              disabled={loading}
              onChange={(e, value) => {
                handleLocationChange(value as string);
              }}
              slotProps={{
                listbox: {},
              }}
              sx={{
                boxShadow: 'none',
              }}
            >
              {stockLocations && stockLocations.length > 0 ? (
                <>
                  {stockLocations?.map(({ id, name }) => (
                    <Option key={id} value={id + ''}>
                      {/* {showroomNameList.includes(name) ? 'Showroom' : name} */}
                      {name}
                    </Option>
                  ))}
                </>
              ) : (
                <Option key="Warehouse" value="Warehouse">
                  Warehouse
                </Option>
              )}
            </Select>
          </FormControl>
          <FormControl required>
            <FormLabel>
              <Typography
                sx={{
                  color: (theme) => theme.palette.brand.charcoal[500],
                  marginBottom: 1,
                }}
              >
                Collection/Delivery Method
              </Typography>
            </FormLabel>

            <Select
              name="deliveryMethod"
              variant="borderplain"
              value={deliveryMethod}
              onChange={(e, value) => {
                setDeliveryMethod(value as string);
              }}
              sx={{
                boxShadow: 'none',
              }}
            >
              {deliveryMethodList.map((method) => (
                <Option key={method} value={method}>
                  {method}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Stack direction="row" spacing={2} width="100%">
          <Button
            variant="secondary"
            color="neutral"
            fullWidth
            onClick={() => onClose(true)}
            sx={{
              py: 1.5,
              fontSize: 'body1.fontSize',
            }}
          >
            Cancel
          </Button>
          <Button
            loading={loading || orderLoading}
            variant="solid"
            color="primary"
            fullWidth
            type="submit"
            disabled={!inStock || !deliveryMethod}
            onClick={giftAddToCart}
            sx={{
              py: 1.5,
              fontSize: 'body1.fontSize',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
          >
            {confirmText ? confirmText : 'Add To Cart'}
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  );
};

export default PosChooseFreeGiftDeliveryModal;
