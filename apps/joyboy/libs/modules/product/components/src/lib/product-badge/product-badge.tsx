import { Box, Typography } from '@castlery/fortress';

/* eslint-disable-next-line */
export interface ProductBadgeProps {
  badgeList: string[];
  hasUsedInPDP?: boolean;
}

export function ProductBadge(props: ProductBadgeProps) {
  const { badgeList, hasUsedInPDP = false } = props;
  if (!badgeList || badgeList.length === 0) {
    return null;
  }
  if (hasUsedInPDP) {
    return (
      <sup
        style={{
          width: 'fit-content',
          whiteSpace: 'nowrap',
          fontWeight: 600,
          padding: '2px 8px',
          lineHeight: 1.5,
          color: '#A45B37',
          fontSize: '16px',
          fontFamily: '!important',
        }}
      >
        {badgeList[0]}
      </sup>
    );
  }
  return (
    <Box
      sx={[
        {
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
        },
      ]}
    >
      <Typography
        sx={{
          width: 'fit-content',
          backgroundColor: (theme) => (hasUsedInPDP ? 'transparent' : theme.palette.brand.sage[500]),
          whiteSpace: 'nowrap',
          fontWeight: hasUsedInPDP ? 600 : 400,
          padding: '2px 8px',
          lineHeight: 1.5,
          color: (theme) => (hasUsedInPDP ? theme.palette.brand.terracotta[500] : theme.palette.brand.charcoal[0]),
          fontSize: hasUsedInPDP ? '16px' : '14px',
        }}
      >
        {badgeList[0]}
      </Typography>
    </Box>
  );
}

export default ProductBadge;
