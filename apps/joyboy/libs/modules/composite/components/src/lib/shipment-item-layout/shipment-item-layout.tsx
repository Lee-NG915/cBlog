'use client';
import { Stack, Divider, useBreakpoints } from '@castlery/fortress';
import { accessInPos } from '@castlery/config';

interface ShipmentItemLayoutProps {
  basicInfo: React.ReactNode;
  productInfo: React.ReactNode;
  serviceInfo: React.ReactNode;
  isPos?: boolean;
}

export const ShipmentItemLayout = ({ basicInfo, productInfo, serviceInfo, isPos = false }: ShipmentItemLayoutProps) => {
  const { mobile, tablet, desktop } = useBreakpoints();

  return (
    <Stack sx={{ pb: 4 }}>
      {basicInfo}

      {isPos && <Divider sx={{ my: { xs: 2, sm: 4 } }} />}

      <Stack direction={accessInPos ? (desktop ? 'row' : 'column') : mobile ? 'column' : 'row'}>
        <Stack sx={{ flex: 1 }}>{productInfo}</Stack>

        <Divider
          orientation={accessInPos ? (desktop ? 'vertical' : 'horizontal') : mobile ? 'horizontal' : 'vertical'}
          sx={{
            ...(mobile
              ? {
                  my: 4,
                }
              : {
                  mx: 6,
                  my: 6,
                }),
          }}
        />
        {serviceInfo && (
          <Stack
            sx={{
              flex: 'none',
              ...(desktop && { width: '18.51vw', maxWidth: 320, py: 6 }),
              ...(tablet && { width: accessInPos ? '100%' : '30.2vw' }),
              ...(mobile && { width: '100%' }),
            }}
          >
            {serviceInfo}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default ShipmentItemLayout;
