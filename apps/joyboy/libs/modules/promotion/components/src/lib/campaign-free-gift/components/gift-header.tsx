import { Box, Typography, IconButton, Tag } from '@castlery/fortress';
import { ChevronUp, Close } from '@castlery/fortress/Icons';
import type { GiftHeaderProps } from '../types';

export const GiftHeader = ({ isChangeGift, isOpen, onToggle, onChangeClose }: GiftHeaderProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: !isChangeGift ? 'pointer' : 'default',
    }}
    onClick={() => {
      if (!isChangeGift) {
        onToggle?.();
      }
    }}
  >
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Tag>Free</Tag>
      <Typography level="body2">Choose your free gift </Typography>
    </Box>

    <IconButton
      color="neutral"
      sx={{
        '--Icon-fontSize': 24,
        minWidth: 24,
        minHeight: 24,
        width: 24,
        height: 24,
        '--Icon-color': (theme) => theme.palette.brand.maroonVelvet[500],
        '&:hover': {
          '--Icon-color': 'var(--fortress-palette-brand-mono-900)',
        },
        svg: {
          width: 24,
          height: 24,
        },
      }}
      onClick={() => {
        if (isChangeGift) {
          onChangeClose?.();
        }
      }}
    >
      {isChangeGift ? (
        <Close />
      ) : (
        <ChevronUp
          sx={{
            color: 'inherit',
            transform: `rotate(${isOpen ? 0 : 180}deg)`,
            transition: 'transform 0.5s ease',
          }}
        />
      )}
    </IconButton>
  </Box>
);
