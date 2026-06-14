import React, { useCallback, useEffect } from 'react';
import { Box, Typography, Card, Stack, Button, NumberInput, Divider } from '@castlery/fortress';
import { TEXT } from './helper';
import { type AvailableServiceProduct } from '@castlery/modules-checkout-services';
import { useAsyncFn } from 'react-use';

export type AddCarryUpServiceFn = (service: {
  sku: string;
  price: string;
  custom_attributes: { number_of_stories: number; number_of_items: number };
}) => Promise<void>;

export interface CarryUpServicesProps {
  keepMounted?: boolean;
  service: AvailableServiceProduct;
  cancel: () => void;

  confirm: AddCarryUpServiceFn;
}

export function CarryUpServices({ keepMounted = true, service, cancel, confirm }: CarryUpServicesProps) {
  // const { capability = 0 } = service;
  const [number_of_stories, setNumberOfStories] = React.useState(1);
  const [number_of_items, setNumberOfItems] = React.useState(1);

  const [confirmState, handleConfirm] = useAsyncFn(async () => {
    return await confirm({
      sku: service.sku ?? '',
      price: service.price ?? '',
      custom_attributes: {
        number_of_stories,
        number_of_items,
      },
    });
  }, [service, confirm, number_of_stories, number_of_items]);

  const onStoriesChange = useCallback(
    (event: React.ChangeEvent<EventTarget>, value: number) => {
      setNumberOfStories(value);
    },
    [setNumberOfStories]
  );

  const onItemsChange = useCallback(
    (event: React.ChangeEvent<EventTarget>, value: number) => {
      setNumberOfItems(value);
    },
    [setNumberOfItems]
  );
  useEffect(() => {
    if (!keepMounted) {
      setNumberOfStories(1);
      setNumberOfItems(1);
    }
  }, [keepMounted, setNumberOfItems, setNumberOfStories]);

  return (
    <Stack spacing={2}>
      <Typography level="body1">
        <div dangerouslySetInnerHTML={{ __html: TEXT.description }} />
      </Typography>
      <Typography level="body1">
        <div dangerouslySetInnerHTML={{ __html: TEXT.note }} />
      </Typography>
      <Typography level="body1">+ ${service?.price} per item, per storey</Typography>
      <Card>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '360px auto' },
            columnGap: 3,
            rowGap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography level="subh2">No. of storeys with no lift access</Typography>
            <Typography level="body2">Maximum of 3 storeys</Typography>
          </Box>
          <NumberInput
            sx={{ justifyContent: 'flex-start' }}
            defaultValue={1}
            min={1}
            max={3}
            value={number_of_stories}
            onChange={onStoriesChange}
          />
        </Box>
        <Divider />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: '360px auto' },
            columnGap: 3,
            rowGap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography level="subh2">No. of items</Typography>
            <Typography level="body2">Weight per item must not exceed 80kg each</Typography>
          </Box>
          <NumberInput
            value={number_of_items}
            sx={{ justifyContent: 'flex-start' }}
            defaultValue={1}
            min={1}
            onChange={onItemsChange}
          />
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
        <Button loading={confirmState.loading} onClick={handleConfirm}>
          Confirm
        </Button>
      </Box>
      <Divider />
      <Typography level="body2" sx={{ color: (theme) => theme.palette.brand.charcoal[500] }}>
        {TEXT.explanation}
      </Typography>
    </Stack>
  );
}

export default CarryUpServices;
