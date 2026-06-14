import React from 'react';
import { Box, Stack, Typography } from '@castlery/fortress';
import { useBreakpoints } from '@castlery/fortress/hooks';

type TieredItemProps = {
  _uid?: string;
  uid?: string;
  sub_header?: string;
  sub_header_colour?: { color: string };
  description?: string;
  description_colour?: { color: string };
  subHeader?: string;
  subHeaderColour?: { color: string };
  descriptionColour?: { color: string };
  borderType?: string;
  borderColor?: string;
  needMargin?: boolean;
  mobileWidth?: string;
  stickyToRight?: boolean;
  itemJustifyContent?: string;
  outerHeight?: number;
};

const TieredItem = ({
  _uid,
  uid,
  sub_header,
  sub_header_colour,
  description,
  description_colour,
  subHeader,
  subHeaderColour,
  descriptionColour,
  borderType,
  borderColor = '#000',
  needMargin,
  mobileWidth,
  stickyToRight = false,
  itemJustifyContent,
  outerHeight,
}: TieredItemProps) => {
  const { mobile, tablet, desktop } = useBreakpoints();
  return (
    <Box
      key={_uid || uid}
      sx={() => ({
        boxSizing: 'border-box',
        minWidth: mobile ? mobileWidth || '7.5rem' : tablet ? '9.5rem' : '14.5rem',
        borderLeft: borderType === 'left' ? `${borderColor} 2px solid` : null,
        borderRight: borderType === 'right' ? `${borderColor} 2px solid` : null,
        marginTop: needMargin ? '1rem' : null,
        paddingLeft: 1,
        paddingRight: 1,
        width: stickyToRight ? 'fit-content' : null,
        display: 'flex',
        justifyContent: itemJustifyContent !== undefined ? itemJustifyContent : stickyToRight ? 'flex-end' : null,
        height: outerHeight,
        maxWidth: mobile ? '50%' : '180px',
      })}
    >
      <Stack direction="column" alignItems="center" justifyContent="center">
        {(sub_header || subHeader) && (
          <Typography
            sx={(theme) => ({
              fontSize: desktop ? 18 : 14,
              fontWeight: 600,
              textAlign: 'center',
              color: sub_header_colour?.color || subHeaderColour?.color || theme.palette.brand.terracotta[500],
            })}
          >
            {sub_header || subHeader}
          </Typography>
        )}
        {description && (
          <Typography
            sx={(theme) => ({
              fontSize: mobile ? 12 : tablet ? 12 : 18,
              color: description_colour?.color || descriptionColour?.color || theme.palette.brand.terracotta[500],
              textAlign: 'center',
              minWidth: 104,
              maxWidth: desktop ? 198 : tablet ? 136 : 163,
            })}
          >
            {description}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export { TieredItem, TieredItemProps };
