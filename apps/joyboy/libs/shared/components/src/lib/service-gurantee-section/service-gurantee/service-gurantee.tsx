'use client';
import { Stack, useBreakpoints } from '@castlery/fortress';
import type { ServiceGuranteeItemProps } from '../service-gurantee-item/service-gurantee-item';
import { ServiceGuranteeItem } from '../service-gurantee-item/service-gurantee-item';
import { SERVICE_GUARANTEES_CONFIG } from './config/data.config';

export interface ServiceGuranteeProps {
  onPolicyLinkClick?: (title: string) => void;
}

export function ServiceGurantee({ onPolicyLinkClick }: ServiceGuranteeProps) {
  const { desktop, tablet, md, mobile } = useBreakpoints();
  const list = SERVICE_GUARANTEES_CONFIG as ServiceGuranteeItemProps[];
  return (
    <Stack
      sx={{
        backgroundColor: (theme) => theme.palette.brand.warmLinen[500],
        ...(mobile && {
          px: 6,
          py: 8,
          rowGap: 6,
        }),
        ...(desktop && {
          px: 8,
          py: 8,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(auto,358px))',
          justifyContent: 'center',
          columnGap: md ? 6 : '3.47vw',

          // ...(md
          //   ? {
          //       display: 'grid',
          //       gridTemplateColumns: 'repeat(2, 358px)',
          //       justifyContent: 'center',
          //       columnGap: 8,
          //       rowGap: 8,
          //     }
          //   : {
          //       display: 'grid',
          //       gridTemplateColumns: 'repeat(4, minmax(auto,358px))',
          //       justifyContent: 'center',
          //       columnGap: '3.47vw',
          //     }),
        }),

        ...(tablet && {
          px: 6,
          py: 8,
          rowGap: 6,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 342px)',
          justifyContent: 'center',
          gap: 6,
        }),
      }}
    >
      {list?.map((item, index) => {
        return (
          <Stack
            key={index}
            sx={{
              display: 'flex',
              height: '100%',
              background: (theme) => theme.palette.common.white,
              ...(mobile && {
                px: 2,
              }),
            }}
          >
            <ServiceGuranteeItem {...item} onPolicyLinkClick={onPolicyLinkClick} />
          </Stack>
        );
      })}
    </Stack>
  );
}
