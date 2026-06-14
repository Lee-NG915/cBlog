import React from 'react';
import { Chip, Box, IconButton } from '@castlery/fortress';
import { Shipping, ArrowForward } from '@castlery/fortress/Icons';
import { addressFeatureInAU } from 'config';

interface ZipChipProps {
  fullCart?: boolean;
  action: () => void;
}
const ZipChip: React.FC<ZipChipProps> = ({ fullCart = false, action }) => (
  <Box sx={{ position: 'relative', mb: 1 }}>
    <Chip
      variant="solid"
      startDecorator={<Shipping />}
      endDecorator={
        <IconButton
          variant="plain"
          sx={{ color: '#F6F3E7', padding: 0, minHeight: '20px', svg: { width: '20px', height: '20px' } }}
        >
          <ArrowForward />
        </IconButton>
      }
      sx={{
        borderRadius: 0,
        width: fullCart ? '100vw' : '100%',
        maxWidth: fullCart ? '100vw' : '100%',
        padding: '4px 12px',
        color: '#F6F3E7',
        '.MuiChip-action,.MuiChip-action:hover,.MuiChip-colorContext': {
          backgroundColor: '#414128',
          borderColor: '#414128',
        },
        position: 'absolute',
        left: fullCart ? '-16px' : 0,
      }}
      onClick={action}
    >
      Enter {addressFeatureInAU ? 'postcode' : 'zip code'} to calculate shipping cost
    </Chip>
    <Box className="chip_placeholder" sx={{ height: 33 }} />
  </Box>
);

export default React.memo(ZipChip);
