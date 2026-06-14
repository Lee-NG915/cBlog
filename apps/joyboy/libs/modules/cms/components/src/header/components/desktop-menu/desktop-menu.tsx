import { Stack, WebLOGO } from '@castlery/fortress';
import { WebMenu, WebUserBar } from '@castlery/modules-product-components';

export const DesktopMenu = ({ originalMenu, outerMenuData, currentSalePages }) => {
  let needHideNew = false;
  let needHideSale = false;
  if (Array.isArray(outerMenuData)) {
    outerMenuData.forEach((item) => {
      if (item.slug === 'new') {
        needHideNew = !!item.disable;
      }
      if (item.slug === 'sale') {
        needHideSale = !!item.disable;
      }
    });
  }
  return (
    <Stack
      sx={{
        width: '100%',
        // position: 'relative',
        height: 76,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'visible',
        padding: '8px 0 !important',
        '& > a:first-of-type': {
          marginLeft: '1px !important',
        },
      }}
    >
      <WebLOGO />
      {originalMenu && originalMenu.children && originalMenu.children.length > 0 && (
        <WebMenu
          cmsOriginalData={originalMenu}
          cmsOuterMenuData={{ children: outerMenuData }}
          currentSalePages={currentSalePages}
          needHideNew={needHideNew}
          needHideSale={needHideSale}
        />
      )}
      <WebUserBar />
    </Stack>
  );
};
