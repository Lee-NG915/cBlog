'use client';

import { EcEnv } from '@castlery/config';
import { Link, useBreakpoints } from '@castlery/fortress';
import { Castlery } from '@castlery/fortress/Icons';

type WebLOGOProps = {
  usedInMobile?: boolean;
};

const WebLOGO = ({ usedInMobile }: WebLOGOProps) => {
  const { mobile } = useBreakpoints();
  return (
    <Link
      aria-label="Go to homepage"
      sx={[
        {
          svg: {
            minWidth: '128px',
            width: '100%',
            maxWidth: '200px',
            // width: '141px',
            // minWidth: '129px',
            height: '50px',
          },
          marginRight: usedInMobile ? 0 : 4,
          // width: '174px',
          // minWidth: '129px',
          // // maxWidth: '140px',
          // minHeight: '76px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        },
        mobile && {
          svg: {
            width: '128px',
            height: '18px',
          },
        },
      ]}
      href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}`}
    >
      <Castlery
        sx={{
          fill: '#844025 !important',
          width: '100%',
        }}
      />
    </Link>
  );
};

export { WebLOGO };
