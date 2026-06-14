'use client';
import { EcEnv } from '@castlery/config';
import { Chip, Link, Typography } from '@castlery/fortress';
import { ArrowRight, EmojiObjects } from '@castlery/fortress/Icons';

export default function VoucherBanner() {
  return (
    <Chip
      color="success"
      component={Link}
      href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/the-castlery-club`}
      variant="solid"
      endDecorator={<ArrowRight />}
      startDecorator={<EmojiObjects />}
      sx={{
        marginTop: 3,
        // 强制覆盖 Link 的样式
        '&:hover': {
          backgroundColor: 'var(--fortress-palette-success-500)',
          color: 'white',
        },
        '&:active': {
          backgroundColor: 'var(--fortress-palette-success-600)',
          color: 'white',
        },
      }}
    >
      <Typography level="caption1" textAlign="left">
        Earn and redeem your credits for discounts on your next purchase!
      </Typography>
    </Chip>
  );
}
