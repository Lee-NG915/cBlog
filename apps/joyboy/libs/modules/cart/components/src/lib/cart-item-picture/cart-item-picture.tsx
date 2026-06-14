'use client';

import { Stack, Link, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { ITEM_PICTURE_LAYOUT_CONFIG, LAYOUT_MODE } from './layout.config';
import { useMemo } from 'react';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { ProductTypeMapping, accessInWeb } from '@castlery/config';
import { useCloseMiniCartOnNavigate } from '../hooks/useCloseMiniCartOnNavigate';

export interface CartItemPictureProps {
  imageUrl: string;
  productUrl: string;
  productType: ProductTypeMapping;
  layoutMode: keyof typeof LAYOUT_MODE;
  isBundleImage?: boolean;
  alt?: string;
}

export { LAYOUT_MODE } from './layout.config';

export function CartItemPicture({
  imageUrl,
  productUrl,
  isBundleImage = false,
  layoutMode,
  productType,
  alt = 'Product image',
}: CartItemPictureProps) {
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const { mobile, tablet } = useBreakpoints();
  const handleLinkClick = useCloseMiniCartOnNavigate();

  const isLinkable =
    ![ProductTypeMapping.SERVICE, ProductTypeMapping.SWATCH].includes(productType as ProductTypeMapping) && accessInWeb;

  const { width, height, marginLeft } = useMemo(() => {
    const mode = miniCartMode ? LAYOUT_MODE.MINI_CART : layoutMode;
    const subKey = isBundleImage ? 'BUNDLE_IMAGE_SIZE' : 'IMAGE_SIZE';
    const config = ITEM_PICTURE_LAYOUT_CONFIG[mode as keyof typeof LAYOUT_MODE];
    const device = mobile ? 'MOBILE' : tablet ? 'TABLET' : 'DESKTOP';

    return {
      width: config[subKey][device].width || 0,
      height: config[subKey][device].height || 0,
      marginLeft: config.MARGIN_LEFT[device] || 0,
    };
  }, [layoutMode, miniCartMode, tablet, mobile, isBundleImage]);

  return (
    <Stack
      sx={{
        width: width,
        height: height,
        ml: isBundleImage ? marginLeft : 0,
        flex: 'none',
      }}
    >
      {isLinkable ? (
        <Link
          href={productUrl}
          underline="none"
          onClick={handleLinkClick}
          sx={{
            paddingBlock: 0,
            paddingInline: 0,
            marginBlock: 0,
            marginInline: 0,
          }}
        >
          <FortressImage src={imageUrl} ratio={width / height} alt={alt} />
        </Link>
      ) : (
        <FortressImage src={imageUrl} ratio={width / height} alt={alt} />
      )}
    </Stack>
  );
}
