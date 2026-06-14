'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Stack, Button, Checkbox, Divider } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { PosOnlineCartItem } from '../cart-line-item/pos-online-cart-item';
import type { Order, LineItem } from '@castlery/types';

export interface PosOnlineCartContentProps {
  cancel: () => void;
  confirm: ({ to, itemIds }: { to: 'pos' | 'web'; itemIds?: number[] }) => Promise<unknown>;
  onlineOrder: Order | null;
}
export function PosOnlineCartContent({ cancel, confirm, onlineOrder }: PosOnlineCartContentProps) {
  const { items, allIds }: { items: LineItem[]; allIds: number[] } = useMemo(
    () => ({
      items: onlineOrder?.line_items || [],
      allIds: (onlineOrder?.line_items || []).map((item) => item.id),
    }),
    [onlineOrder?.line_items]
  );

  const [selectedItems, setSelectedItems] = React.useState<number[]>([]);
  const allSelected = React.useMemo(() => selectedItems.length === allIds.length, [selectedItems, allIds]);

  const handleSelect = React.useCallback(
    (checked: boolean, itemId: number) =>
      setSelectedItems((pre) => (checked ? [...pre, itemId] : pre.filter((id) => id !== itemId))),
    [setSelectedItems]
  );
  const selectAll = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setSelectedItems(() => (event.target.checked ? allIds : [])),
    [setSelectedItems, allIds]
  );

  const [transferState, confirmFn] = useAsyncFn(async () => {
    return confirm({ to: 'pos', itemIds: selectedItems }).finally(() => {
      cancel && cancel();
    });
  }, [selectedItems, confirm]);
  const hasItems = items?.length > 0;
  // TODO 要处理 loading 的时候 不要让用户点
  // TODO 可以使用 我刚刚 封装的 back-drop
  return (
    <>
      <Stack spacing={2}>
        <Typography level="body1">Select products from online cart to add to POS.</Typography>
        <Typography level="body2" color="danger">
          Note: Once products are added to POS, the products will be removed from customers’ online cart.
        </Typography>
        {hasItems ? (
          <>
            <Stack>
              <Checkbox label="Select All" checked={allSelected} onChange={selectAll} />
            </Stack>
            <Divider />
            {items.map((item) => (
              <Box key={item.id}>
                <Stack spacing={2} key={item.id}>
                  <PosOnlineCartItem
                    item={item}
                    checked={selectedItems.includes(item?.id)}
                    onChange={(checked: boolean) => handleSelect(checked, item.id)}
                  />
                </Stack>
                <Divider />
              </Box>
            ))}
          </>
        ) : (
          <>
            <Typography level="body2" sx={{ marginX: 'auto', marginY: 4 }}>
              Online Cart Is Empty
            </Typography>
            <Divider />
          </>
        )}
      </Stack>
      <Stack
        alignItems={'flex-end'}
        sx={{
          paddingY: 1.5,
          gap: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          justifyContent: 'space-between',
        }}
      >
        <Button variant="tertiary" onClick={cancel}>
          Cancel
        </Button>
        <Button loading={transferState.loading} onClick={confirmFn}>
          Add to POS
        </Button>
      </Stack>
    </>
  );
}

export default PosOnlineCartContent;
