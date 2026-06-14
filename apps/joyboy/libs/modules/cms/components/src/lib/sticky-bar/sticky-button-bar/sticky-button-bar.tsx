'use client';
import { Stack, Typography } from '@castlery/fortress';
import { CmsButton } from '../../cms-button/cms-button';
import type { StickyButtonBarV2 } from '@castlery/modules-cms-domain';

interface StickyButtonBarProps {
  blok: StickyButtonBarV2;
}
export function StickyButtonBar({ blok }: StickyButtonBarProps) {
  // console.log('----blok>>', blok);
  const { button = [] } = blok;
  return (
    <Stack direction={'row'} sx={{ justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 1, pb: 2 }}>
      <Typography level="body2">Owen Chaise Sectional Sofa</Typography>
      <Stack>
        {button.map((item) => (
          <CmsButton blok={item} key={item._uid} />
        ))}
      </Stack>
    </Stack>
  );
}

export default StickyButtonBar;
