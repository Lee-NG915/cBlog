import { sbApiClient } from '../storyblok';
import { WebNoticeBar, WebGlobalNav } from '@castlery/modules-product-components';
import { DesktopMenu } from './components/desktop-menu/desktop-menu';
import MobileMenu from './components/mobile-menu/mobile-menu';
import { Container, Sheet, Box } from '@castlery/fortress';
import { MenuClient } from './header.client';

// Initialize StoryblokService

// NoticeBarWrapper.tsx
async function NoticeBarWrapper({ noticeSwitch }: { noticeSwitch?: string }) {
  const data = await sbApiClient.getGlobalNotice();
  if (noticeSwitch === 'close') return;
  if (!data) return;
  const { noticeBarData, noticeBarMobileData } = data;

  return <WebNoticeBar noticeBarData={noticeBarData} noticeBarMobileData={noticeBarMobileData} />;
}

// GlobalNavWrapper.tsx
async function GlobalNavWrapper() {
  const globalNavData = await sbApiClient.getGlobalNavWithDedup();
  if (!globalNavData) return;
  return <WebGlobalNav globalNavData={globalNavData} />;
}

async function MenuWrapper({ needHideDYBanner = false }: { needHideDYBanner?: boolean }) {
  const data = await sbApiClient.getGlobalHeader();
  if (!data) return;
  const { originalMenu, outerMenuData, currentSalePages, globalNavData, collectionsData } = data;
  // 提取共同的props
  const commonProps = {
    originalMenu,
    outerMenuData,
    currentSalePages,
    collectionsData,
  };

  return (
    <Box data-header-container="true">
      <MenuClient originalMenu={originalMenu} outerMenuData={outerMenuData} collectionsData={collectionsData} />
      {/* 移动端菜单 */}
      <Sheet
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },
        }}
      >
        <MobileMenu {...commonProps} globalNavData={globalNavData} />
      </Sheet>

      {/* 桌面端菜单 */}

      <Sheet
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },
          backgroundColor: '#F6F3E7',
          position: 'relative',
        }}
      >
        <Container>
          <DesktopMenu {...commonProps} />
        </Container>
      </Sheet>
      {!needHideDYBanner && <div id="dy-banner-placeholder-under-menu" />}
    </Box>
  );
}

// WebGlobalHead.tsx
export function Header({
  noticeSwitch,
  needHideDYBanner = false,
}: {
  noticeSwitch?: string;
  needHideDYBanner?: boolean;
}) {
  return (
    <>
      <NoticeBarWrapper noticeSwitch={noticeSwitch} />
      <GlobalNavWrapper />
      <MenuWrapper needHideDYBanner={needHideDYBanner} />
    </>
  );
}
