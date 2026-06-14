'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, Card, Divider, Button } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { type AvailableServiceProduct } from '@castlery/modules-checkout-services';
import { TEXT } from './helper';
import { useAsyncFn } from 'react-use';

export interface DisposalServicesProps {
  keepMounted?: boolean;
  serviceProduct: AvailableServiceProduct;
  cancel: () => void;
  confirm: (
    selected: { sku: string; quantity: number; type: string; name: string; price: string; size: string }[]
  ) => Promise<void>;
}

export function DisposalServices({
  serviceProduct: service,
  cancel,
  confirm,
  keepMounted = true,
}: DisposalServicesProps) {
  const [selectList, setSelectList] = useState<{ name: string; quantity: number }[]>([]);

  const skuToProMapping = useMemo(() => {
    const map: Map<string, string> = new Map();
    if (!service?.data || !Array.isArray(service?.data)) {
      return map;
    }
    service.data.forEach((item) => {
      if (item.data) {
        item.data.forEach((subItem) => {
          map.set(subItem.name, item.name);
        });
      }
    });
    return map;
  }, [service?.data]);

  /**
   * Handle select event
   */
  const handleSelect = useCallback(
    (name: string) =>
      setSelectList((pre) => {
        let target = { name: name, quantity: 1 };
        const targetIndex = pre.findIndex((item) => item.name === name);
        if (targetIndex >= 0) {
          target = pre[targetIndex] as { name: string; quantity: number };
          return [
            ...pre.slice(0, targetIndex),
            { ...target, quantity: target.quantity + 1 },
            ...pre.slice(targetIndex + 1),
          ];
        }
        return [...pre.filter((item) => item.name !== name), target];
      }),
    [setSelectList]
  );
  /**
   * Handle remove event
   */
  const handleRemove = useCallback(
    (name: string) => {
      setSelectList((pre) => {
        const targetIndex = pre.findIndex((item) => item.name === name);
        if (targetIndex >= 0) {
          return [...pre.slice(0, targetIndex), ...pre.slice(targetIndex + 1)];
        }
        return pre;
      });
    },
    [setSelectList]
  );
  /**
   * Disable checker
   */
  const disableChecker = useCallback(
    (name: string) => {
      const item = service?.data?.find((item) => item.name === name);
      const limit = item?.capability || 0;
      const selected = selectList.filter((item) => skuToProMapping.get(item.name) === name);
      const number = selected.reduce((acc, item) => acc + item.quantity, 0);
      return number >= limit;
    },
    [service, selectList, skuToProMapping]
  );
  const [confirmState, confirmHandler] = useAsyncFn(async () => {
    const result = selectList?.map((item) => {
      const mainName = skuToProMapping.get(item.name);
      const mainItem = service?.data?.find((item) => item.name === mainName);
      const subItem = mainItem?.data?.find((subItem) => subItem.name === item.name);
      return {
        sku: subItem?.sku || '',
        quantity: item.quantity,
        size: mainItem?.type || '',
        name: subItem?.name || '',
        price: subItem?.price || '',
        type: 'disposal',
      };
    });
    return await confirm(result);
  }, [selectList, service, skuToProMapping]);

  useEffect(() => {
    if (!keepMounted) {
      setSelectList([]);
    }
  }, [keepMounted, setSelectList]);

  return (
    <Stack spacing={2}>
      <Typography level="body2">{TEXT.description}</Typography>
      <Card sx={{ p: 0 }}>
        {Array.isArray(service?.data) &&
          service.data.map((item, index) => (
            <>
              {index > 0 && <Divider />}
              <Box key={item.name} sx={{ p: 2 }}>
                <Stack
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '200px 1fr' },
                    gap: { xs: 1, lg: 3 },
                  }}
                >
                  <Box>
                    <Typography level="subh2">{item.name}</Typography>
                    <Typography sx={{ color: (theme) => theme.palette.text.secondary }}>
                      Select up to {item.capability} {item.capability > 1 ? 'items' : 'item'}
                    </Typography>
                    <Typography>+ ${item.data[0]?.price} per item</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }}>
                    {Array.isArray(item.data) &&
                      item.data.map((subItem) => (
                        <Button
                          key={subItem.sku}
                          variant="secondary"
                          sx={{
                            height: 40,
                            color: (theme) => theme.palette.text.secondary,
                            borderColor: (theme) => theme.palette.text.secondary,
                          }}
                          onClick={() => handleSelect(subItem.name)}
                          disabled={disableChecker(item.name)}
                        >
                          <Typography level="body2" sx={{ color: 'inherit' }}>
                            {subItem.name}
                          </Typography>
                        </Button>
                      ))}
                  </Box>
                </Stack>
              </Box>
            </>
          ))}
        <Divider />
        <Box sx={{ minHeight: 96, p: 2 }}>
          <Typography level="subh2">{service?.name} Selected:</Typography>
          <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }}>
            {selectList.map((item) => (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  background: '#EEE',
                  padding: 1,
                  gap: 1.5,
                }}
              >
                <Typography>
                  {item.name} {item.quantity > 1 ? `x ${item.quantity}` : ''}
                </Typography>
                <Button
                  variant="tertiary"
                  sx={{ padding: 0, width: 24, height: 24, minHeight: 24 }}
                  onClick={() => handleRemove(item.name)}
                >
                  <Close />
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2,minmax(120px,173px))',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Button variant="tertiary" onClick={cancel}>
          Cancel
        </Button>
        <Button loading={confirmState.loading} onClick={confirmHandler}>
          Confirm
        </Button>
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', flexDirection: 'column', color: (theme) => theme.palette.brand.charcoal[500] }}>
        <Typography level="body2" sx={{ color: 'inherit' }}>
          {TEXT.note.title}
        </Typography>
        {TEXT.note.descriptions.map((description, index) => (
          <Typography key={index} level="body2" sx={{ color: 'inherit' }}>
            <Typography sx={{ marginX: 1.5 }}>•</Typography>
            {description}
          </Typography>
        ))}
        <Typography level="body2" sx={{ color: 'inherit', marginY: 3 }}>
          {TEXT.note.explanation}
        </Typography>
      </Box>
    </Stack>
  );
}

export default DisposalServices;
