'use client';
import React, { useMemo } from 'react';
import { Box, Typography, Stack, Button, Checkbox, Divider } from '@castlery/fortress';
import { useAsyncFn } from 'react-use';
import { PosOnlineCartItem } from './pos-online-cart-item';
import type { LineItemSchema } from '@castlery/types';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

export interface PosOnlineCartContentProps {
  onlineItems: LineItemSchema[];
  onClose: () => void;
  onConfirm: (items: LineItemSchema[]) => Promise<void>;
}
export function PosOnlineCartContent({ onlineItems, onClose, onConfirm }: PosOnlineCartContentProps) {
  const { t } = useTranslation(LocalesNamespace.MODULES_CART, { keyPrefix: 'posOnlineCart' });
  const { items, allIds }: { items: LineItemSchema[]; allIds: string[] } = useMemo(
    () => ({
      items: onlineItems || [],
      allIds: (onlineItems || []).map((item) => item.id),
    }),
    [onlineItems]
  );

  const [selectedItems, setSelectedItems] = React.useState<LineItemSchema['id'][]>([]);
  const allSelected = React.useMemo(() => selectedItems.length === allIds.length, [selectedItems, allIds]);

  const handleSelect = React.useCallback(
    (checked: boolean, itemId: LineItemSchema['id']) =>
      setSelectedItems((pre) => (checked ? [...pre, itemId] : pre.filter((id) => id !== itemId))),
    [setSelectedItems]
  );
  const selectAll = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setSelectedItems((pre) => (event.target.checked ? allIds : [])),
    [setSelectedItems, allIds]
  );

  const [transferState, confirmFn] = useAsyncFn(async () => {
    const items = onlineItems.filter((item) => selectedItems.includes(item.id));
    return onConfirm(items).finally(() => {
      onClose?.();
    });
  }, [selectedItems, onConfirm]);

  const hasItems = useMemo(() => items?.length > 0, [items]);

  return (
    <>
      <Stack spacing={2}>
        <Typography level="body1">{t('description')}</Typography>
        <Typography level="body2" color="danger">
          {t('notice')}
        </Typography>
        {hasItems ? (
          <>
            <Stack>
              <Checkbox label={t('selectAll')} checked={allSelected} onChange={selectAll} />
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
              {t('empty')}
            </Typography>
            <Divider />
          </>
        )}
      </Stack>
      <Stack
        alignItems={'flex-end'}
        sx={{
          py: 6,
          gap: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(2,1fr)',
          justifyContent: 'space-between',
        }}
      >
        <Button variant="tertiary" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button disabled={selectedItems.length <= 0} loading={transferState.loading} onClick={confirmFn}>
          {t('confirm')}
        </Button>
      </Stack>
    </>
  );
}

export default PosOnlineCartContent;
