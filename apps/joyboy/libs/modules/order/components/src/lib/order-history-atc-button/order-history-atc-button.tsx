'use client';
import { useState, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  useBreakpoints,
  Button,
  Tooltip,
  ClickAwayListener,
  Stack,
  List,
  ListItem,
} from '@castlery/fortress';
import {
  EcEnv,
  basePageConfig,
  accessInPos,
  posRoutes,
  ProductTypeMapping,
  MarketCurrency,
  OnlineAddCartSource,
  OfflineAddCartSource,
} from '@castlery/config';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { OrderDataV1, OrderShipmentV1, OrderLineItemV1 } from '@castlery/types';
import { Info, Close } from '@castlery/fortress/Icons';
import { useAppDispatch } from '@castlery/shared-redux-store';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { batchAddToCartCommand } from '@castlery/modules-cart-services';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { orderHistoryAtcClickedEvent } from '@castlery/modules-order-domain';
import { logger } from '@castlery/observability';
interface OrderHistoryAtcButtonProps {
  order: OrderDataV1;
  modal: any;
  isWebOrderDetailPage?: boolean;
}

/**
 * 判断是否为 Service 商品
 */
const isServiceProduct = (productType: string) => {
  return productType === ProductTypeMapping.SERVICE;
};

export function OrderHistoryAtcButton({ order, modal, isWebOrderDetailPage = false }: OrderHistoryAtcButtonProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_ORDER, {
    keyPrefix: 'orderInfoOverview',
  });
  const { mobile } = useBreakpoints();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [btnLoading, setBtnLoading] = useState(false);
  // 使用 ref 防止重复点击（因为 setState 是异步的）
  const isSubmittingRef = useRef(false);

  /**
   * 提取所有可加车的商品
   * 过滤规则：
   * 1. 排除 gift 商品
   * 2. 排除 service 商品（普通订单的 service 商品不重新加入购物车）
   */
  const validLineItems = useMemo(() => {
    const items: Array<{
      variantId: number;
      quantity: number;
      salePrice: string;
      currency: string;
      productType: string;
      warrantyId: string;
      isLowStock: boolean;
      variantName: string;
      bundleLineItems?: Array<{
        variantId: number;
        quantity: number;
        optionId: number;
      }>;
      fulfillmentMethod: number;
      fulfillmentWarehouse: number;
    }> = [];

    order.shipments?.forEach((shipment: OrderShipmentV1) => {
      Array.isArray(shipment.lineItems) &&
        shipment.lineItems?.forEach((item: OrderLineItemV1) => {
          // 排除 gift 商品
          if (item.isGift) return;
          // 排除 service 商品
          if (isServiceProduct(item.productType)) return;

          items.push({
            variantId: item.variantId,
            quantity: item.quantity,
            salePrice: item.salePrice,
            currency: item.currency || MarketCurrency,
            productType: item.productType,
            warrantyId: item.warrantyItem?.warrantyOfferId || '',
            isLowStock: false,
            variantName: item.listName, // SKU Name 用于失败时展示
            // 如果是 bundle 商品，添加 bundleLineItems
            ...(item.bundleLineItems && item.bundleLineItems.length > 0
              ? {
                  bundleLineItems: item.bundleLineItems?.map((bundleItem) => ({
                    variantId: bundleItem.variant.id,
                    quantity: bundleItem.quantity,
                    optionId: bundleItem.bundleOption.id,
                  })),
                }
              : {}),
            fulfillmentMethod: shipment?.fulfillmentType,
            fulfillmentWarehouse: shipment?.fulfillmentWarehouse,
          });
        });
    });

    return items;
  }, [order.shipments]);

  /**
   * 跳转到购物车页面
   */
  const navigateToCart = () => {
    window.location.href = accessInPos
      ? `${posRoutes.products}`
      : `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['cart']}`;
  };

  /**
   * 处理批量加车
   * PRD 场景：
   * 1. 所有商品都成功加车 → 弹窗提示成功，可跳转 cart/关闭
   * 2. 部分商品失败 → 弹窗提示成功，使用 failResults.message 作为提示，列出失败商品的 SKU Name，可跳转 cart/关闭
   * 3. 所有商品都失败 → 弹窗提示失败，使用 failResults.message 作为提示，列出失败商品的 SKU Name，仅可关闭
   */
  const handleAddToCart = async () => {
    // 防止重复点击
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setBtnLoading(true);

    dispatch(orderHistoryAtcClickedEvent());

    try {
      // 检查是否有可加车的商品
      if (validLineItems.length === 0) {
        modal.warning({
          title: 'No items to add',
          showCancelBtn: false,
          confirmText: 'Got it',
          desc: 'There are no items available to add to cart.',
        });
        return;
      }

      const source = accessInPos
        ? OfflineAddCartSource.PosOrderHistoryList
        : isWebOrderDetailPage
        ? OnlineAddCartSource.OrderDetails
        : OnlineAddCartSource.OrderHistory;
      // 调用批量加车接口
      const result = await dispatch(
        batchAddToCartCommand({
          lineItems: validLineItems,
          source,
        })
      ).unwrap();

      // 接口返回说明：
      // - 全部成功时：data 为 null
      // - 部分成功/部分失败时：data 包含 createLineResults 和 failResults
      // - 全部失败时：会进入 catch（因为 rejectWithValue）
      const failedItems = result?.failResults || [];
      const failedCount = failedItems.length;
      const successCount = result?.createLineResults?.length ?? (result === null ? validLineItems.length : 0);

      // 场景 2: 部分商品失败（有失败记录也有成功记录）- 成功返回但包含部分失败
      if (failedCount > 0 && successCount > 0) {
        const errorMessage = failedItems[0]?.message || "Some items couldn't be added due to status or stock changes:";
        modal.success({
          title: 'Added to cart!',
          desc: (
            <Stack spacing={2}>
              <Typography level="body1">{errorMessage}</Typography>
              <List sx={{ listStyleType: 'disc', pl: 4 }}>
                {failedItems.map((item) => (
                  <ListItem key={item.variantId} sx={{ display: 'list-item', py: 0.5 }}>
                    <Typography level="body2">{item.variantName}</Typography>
                  </ListItem>
                ))}
              </List>
            </Stack>
          ),
          showCancelBtn: true,
          cancelText: 'CLOSE',
          confirmText: 'VIEW CART',
          onConfirm: navigateToCart,
        });
        return;
      }

      // 场景 1: 所有商品都成功（data 为 null 或无失败记录）
      modal.success({
        title: 'Added to cart!',
        desc: 'Your items have been added to your cart.',
        showCancelBtn: true,
        cancelText: 'CLOSE',
        confirmText: 'VIEW CART',
        onConfirm: navigateToCart,
      });
    } catch (error: unknown) {
      logger.error('批量加车失败:', { error });

      // error 是 BatchAtcErrorResponse 类型（来自 rejectWithValue）
      const errorResponse = error as {
        code?: number;
        msg?: string;
        data?: {
          createLineResults?: unknown[];
          failResults?: Array<{ variantId: number; variantName: string; message: string }>;
        };
      };
      const failedItems = errorResponse?.data?.failResults || [];
      const failedCount = failedItems.length;
      const successCount = errorResponse?.data?.createLineResults?.length || 0;

      //@todo Lee-NG915 报错和error message尽量使用统一的方案吧，不集成在组件内部
      // 场景 3: 所有商品都失败（有失败记录且无成功记录）
      if (failedCount > 0 && successCount === 0) {
        modal.danger({
          title: 'Item is unavailable!',
          showConfirmBtn: false,
          showCancelBtn: true,
          cancelText: 'CLOSE',
          desc: (
            <Stack spacing={2} alignItems="center">
              <Typography level="body1">
                Sorry, the item(s) in your order could not be added to your cart. They may be out of stock or no longer
                available.
              </Typography>
              <List sx={{ listStyleType: 'disc', width: 'fit-content' }}>
                {failedItems.map((item) => (
                  <ListItem key={item.variantId} sx={{ display: 'list-item', textAlign: 'left', width: 'fit-content' }}>
                    <Typography level="body2" sx={{ width: 'fit-content', textAlign: 'left' }}>
                      {item.variantName}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Stack>
          ),
        });
        return;
      }

      // 场景 2: 部分商品失败（有失败记录也有成功记录）- 错误返回但包含部分成功
      if (failedCount > 0 && successCount > 0) {
        modal.success({
          title: 'Added to cart!',
          desc: (
            <Stack spacing={2} alignItems="center">
              <Typography level="body1">
                Some items have been added to your cart, but some couldn’t be added due to status or stock changes:
              </Typography>
              <List sx={{ listStyleType: 'disc', width: 'fit-content' }}>
                {failedItems.map((item) => (
                  <ListItem key={item.variantId} sx={{ display: 'list-item', textAlign: 'left', width: 'fit-content' }}>
                    <Typography level="body2" sx={{ width: 'fit-content', textAlign: 'left' }}>
                      {item.variantName}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Stack>
          ),
          showCancelBtn: true,
          cancelText: 'CLOSE',
          confirmText: 'VIEW CART',
          onConfirm: navigateToCart,
        });
        return;
      }

      // 其他未知错误
      modal.danger({
        title: 'Item is unavailable!',
        showCancelBtn: false,
        confirmText: 'CLOSE',
        desc:
          errorResponse?.msg ||
          "Sorry, the item(s) in your order couldn't be added to your cart. They may be out of stock or no longer available.",
      });
    } finally {
      setBtnLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: mobile ? 2 : 4,
        flexDirection: isWebOrderDetailPage ? 'row-reverse' : 'row',
      }}
    >
      <Button variant="solid" color="primary" size="sm" onClick={handleAddToCart} loading={btnLoading}>
        Add to cart
      </Button>

      {!accessInPos && (
        <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
          <Box>
            <Tooltip
              arrow
              theme="dark"
              placement="top"
              open={tooltipOpen}
              title={
                <Box sx={{ display: 'flex', gap: 1, width: 220 }}>
                  <Typography level="body2">{(t as any)('addBackToCartTooltip')}</Typography>
                  <Close onClick={() => setTooltipOpen(false)} sx={{ cursor: 'pointer' }} />
                </Box>
              }
            >
              <Box onClick={() => setTooltipOpen(!tooltipOpen)} onMouseEnter={() => setTooltipOpen(true)}>
                <Info width={24} height={24} sx={{ cursor: 'pointer' }} />
              </Box>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      )}
    </Box>
  );
}
