'use client';

import { Stack, Tooltip } from '@castlery/fortress';
import { StandardInfo } from '@castlery/fortress/Icons';

interface ProductInfoTooltipProps {
  title?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
}

export const ProductInfoTooltip = (props: ProductInfoTooltipProps) => {
  return (
    <Tooltip title="More Info Here" placement="right" theme="dark" {...props}>
      <Stack justifyContent="center" alignItems="center">
        <StandardInfo />
      </Stack>
    </Tooltip>
  );
};
