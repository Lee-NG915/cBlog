import React, { useMemo, memo } from 'react';
import { Box } from '@castlery/fortress';

interface LayoutPros {
  mobile?: boolean;
  children: React.ReactNode;
}
const InfoWrapper: React.FC<LayoutPros> = ({ mobile = false, children }) => {
  const sxStyle = useMemo(
    () =>
      !mobile
        ? {
            display: 'grid',
            gridTemplateColumns: 'repeat(2,minmax(min(45%,500px),500px))',
            columnGap: 6,
            paddingRight: (theme: any) => theme.spacing(1),
          }
        : {},
    [mobile]
  );

  return <Box sx={sxStyle}>{children}</Box>;
};

export const InfoLayout = memo(InfoWrapper);

const ButtonGroup: React.FC<LayoutPros> = ({ mobile = false, children }) => {
  const sxStyle = useMemo(
    () =>
      mobile
        ? {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 2,
          }
        : {
            display: 'flex',
            flexFlow: 'row wrap',
            alignItems: 'center',
            gap: 6,
          },
    [mobile]
  );

  return <Box sx={{ ...sxStyle, marginY: (theme) => theme.spacing(4) }}>{children}</Box>;
};

export const ButtonLayout = memo(ButtonGroup);
