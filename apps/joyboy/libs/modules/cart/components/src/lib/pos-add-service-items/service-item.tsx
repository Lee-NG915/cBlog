'use client';
import { memo } from 'react';
import { Card, Checkbox, Stack, Typography } from '@castlery/fortress';
import type { AddonServiceType } from '@castlery/modules-order-domain';
import { EcEnv } from '@castlery/config';
import type { ControllerRenderProps } from 'react-hook-form';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

interface ServiceListItemProps {
  item: AddonServiceType;
  field: ControllerRenderProps<Record<string, boolean>, string>;
}

// TODO 这里是不是可以做成 https://mui.com/joy-ui/react-checkbox/#clickable-container
export const ServiceListItem = ({ item, field }: ServiceListItemProps) => {
  const { value, onChange, onBlur, name, ref, disabled } = field;

  return (
    <Card
      sx={{
        padding: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 2,
        px: 6,
        py: 5,
      }}
    >
      <Checkbox
        sx={{ mt: 1 }}
        overlay
        component="label"
        checked={value}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
        onBlur={onBlur}
        name={name}
        disabled={disabled}
        slotProps={{
          input: {
            ref,
          },
        }}
      />
      <Stack sx={{ flex: 1, textAlign: 'left', rowGap: 1 }}>
        <Typography level="subh2">{item.name}</Typography>
        <Typography level="body2">{item.description}</Typography>
      </Stack>
      <Typography>
        + {currencySymbol}
        {item.price}
      </Typography>
    </Card>
  );
};

export default memo(ServiceListItem);
