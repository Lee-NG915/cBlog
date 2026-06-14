'use client';

import { Box, Stack, Tab, TabList, TabProps, Tabs, Typography, useBreakpoints } from '@castlery/fortress';
import { Account, HomeWork, Logout, Loyalty, MonetizationOn, Receipt, Reviews } from '@castlery/fortress/Icons';
import { CustomLink } from '@castlery/shared-components';
import { useSelectedLayoutSegment } from 'next/navigation';
import { memo, useMemo, useEffect, useRef } from 'react';
import { signOut } from '@castlery/modules-user-services';
import { useAppDispatch } from '@castlery/shared-redux-store';

const navigationItems = [
  { id: 'overview', label: 'ACCOUNT', IconComponent: Account, linkKey: 'profile' },
  { id: 'orders', label: 'ORDERS', IconComponent: Receipt, linkKey: 'orders' },
  { id: 'vouchers', label: 'VOUCHERS', IconComponent: Loyalty, linkKey: 'vouchers' },
  {
    id: 'rewards',
    label: 'REWARDS',
    IconComponent: MonetizationOn,
    linkKey: 'rewards',
  },
  { id: 'address', label: 'ADDRESS', IconComponent: HomeWork, linkKey: 'address' },
  { id: 'reviews', label: 'REVIEWS', IconComponent: Reviews, linkKey: 'my-reviews' },
];

// 路由段到索引的映射
const SEGMENT_TO_INDEX = {
  profile: 0,
  orders: 1,
  vouchers: 2,
  'the-castlery-club': 3,
  address: 4,
  reviews: 5,
  'order-details': 1,
} as const;

const CustomTab = ({ linkKey, children, ...props }: { linkKey: string; children: React.ReactNode } & TabProps) => {
  return (
    <CustomLink
      linkKey={linkKey}
      style={{
        display: 'block', // 让 a 标签变为块级元素
        textDecoration: 'none',
        flexShrink: 0,
        '&:WebkitAnyLink': {
          textDecoration: 'none',
        },
      }}
    >
      <Tab {...props}>{children}</Tab>
    </CustomLink>
  );
};

export const AccountSidebar = memo(() => {
  const segment = useSelectedLayoutSegment(); // 直接获取当前active的segment: 'profile', 'orders' 等
  const { desktop, tablet, mobile } = useBreakpoints();
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeIndex = useMemo(() => {
    return segment ? SEGMENT_TO_INDEX[segment as keyof typeof SEGMENT_TO_INDEX] ?? 0 : 0;
  }, [segment]);

  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!desktop && tabListRef.current) {
      const tabList = tabListRef.current;
      const activeTab = tabList.querySelector(`[data-tab-index="${activeIndex}"]`) as HTMLElement;

      if (activeTab) {
        const tabListRect = tabList.getBoundingClientRect();
        const activeTabRect = activeTab.getBoundingClientRect();

        // 计算需要滚动的距离，让 active tab 居中
        const scrollLeft = activeTab.offsetLeft - tabListRect.width / 2 + activeTabRect.width / 2;

        tabList.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex, desktop]);

  const handleLogout = async () => {
    await dispatch(signOut({})).unwrap();
  };
  // 移动端/平板端的水平 Tab 内容
  const mobileAndTabletTabs = (
    <Tabs
      value={activeIndex >= 0 ? activeIndex : 0}
      orientation="horizontal"
      onChange={(e, value) => {
        if (value === 6) {
          handleLogout();
        }
      }}
    >
      <TabList
        ref={tabListRef}
        disableUnderline
        sx={{
          width: '100%',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          px: mobile ? 0 : 2,
        }}
      >
        {navigationItems.map((item, index) => {
          const { IconComponent } = item;
          return (
            <CustomTab
              key={item.id}
              variant="underline"
              sx={{ flexShrink: 0 }}
              linkKey={item.linkKey}
              data-tab-index={index}
              aria-label={`${item.label} tab`}
            >
              <IconComponent style={{ width: '20px', height: '20px' }} />
              <Typography level="subh2">{item.label}</Typography>
            </CustomTab>
          );
        })}

        <Tab
          disableIndicator
          variant="underline"
          data-tab-index={navigationItems.length}
          aria-label="Logout"
          sx={{
            display: 'block',
            flexShrink: 0,
          }}
        >
          <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} gap={2}>
            <Logout style={{ width: '20px', height: '20px' }} />
            <Typography level="subh2">LOG OUT</Typography>
          </Stack>
        </Tab>
      </TabList>
    </Tabs>
  );

  // 桌面端的垂直侧边栏内容
  const desktopTabsContent = (
    <Stack spacing={3}>
      <Tabs
        value={activeIndex >= 0 ? activeIndex : 0}
        orientation="vertical"
        onChange={(e, value) => {
          if (value === 6) {
            handleLogout();
          }
        }}
      >
        <TabList
          disableUnderline
          sx={{
            width: '100%',
            gap: 6,
          }}
        >
          {navigationItems.map((item) => {
            const { IconComponent } = item;
            return (
              <CustomTab
                key={item.id}
                disableIndicator
                linkKey={item.linkKey}
                aria-label={`${item.label} tab`}
                sx={{
                  width: '100%',
                }}
              >
                <IconComponent style={{ marginRight: '12px', width: '20px', height: '20px' }} />
                <Typography level="subh2">{item.label}</Typography>
              </CustomTab>
            );
          })}

          <Tab disableIndicator aria-label="Logout">
            <Logout style={{ marginRight: '12px', width: '20px', height: '20px' }} />
            <Typography level="subh2">LOG OUT</Typography>
          </Tab>
        </TabList>
      </Tabs>
    </Stack>
  );

  return (
    <aside className="account-sidebar">
      <Box
        sx={{
          ...(desktop && {
            // paddingRight: 7,
            py: 8,
            px: 7,
            height: '100%',
            borderRight: '1px solid',
            borderColor: 'var(--fortress-palette-brand-mono-300)',
          }),
          ...(tablet && {
            paddingTop: 3,
          }),
          ...(mobile && {
            paddingTop: 2,
          }),
        }}
      >
        {desktop ? desktopTabsContent : mobileAndTabletTabs}
      </Box>
    </aside>
  );
});

AccountSidebar.displayName = 'AccountSidebar';
