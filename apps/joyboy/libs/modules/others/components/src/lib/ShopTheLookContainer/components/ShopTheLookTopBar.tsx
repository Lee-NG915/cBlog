'use client';

import { Button, ButtonGroup, Container, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import React, { useEffect, useState } from 'react';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { usePathname, useRouter } from 'next/navigation';
import { trackCommonPageViewEvent } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';
import { useAppDispatch } from '@castlery/shared-redux-store';

const tabList = [
  {
    label: 'Living Room',
    value: 'living-room',
  },
  {
    label: 'Dining Room',
    value: 'dining-room',
  },
  {
    label: 'Bedroom',
    value: 'bedroom',
  },
  {
    label: 'Outdoor',
    value: 'outdoor',
  },
  {
    label: 'By Collection',
    value: 'by-collection',
  },
];

const ShopTheLookTopBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { desktop } = useBreakpoints();
  const dispatch = useAppDispatch();

  // 从路由中提取 activeTab
  const getActiveTabFromPath = (): 'bedroom' | 'living-room' | 'dining-room' | 'outdoor' | 'by-collection' => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];

    if (['bedroom', 'living-room', 'dining-room', 'outdoor', 'by-collection'].includes(lastSegment)) {
      return lastSegment as 'bedroom' | 'living-room' | 'dining-room' | 'outdoor' | 'by-collection';
    }
    return 'living-room'; // 默认值
  };

  const activeTab = getActiveTabFromPath();

  // 根据 activeTab 获取显示文本
  const getActiveTabDisplay = (
    tab: string
  ): 'Living Room' | 'Dining Room' | 'Bedroom' | 'Outdoor' | 'By Collection' => {
    const tabMap: Record<string, 'Living Room' | 'Dining Room' | 'Bedroom' | 'Outdoor' | 'By Collection'> = {
      'living-room': 'Living Room',
      'dining-room': 'Dining Room',
      bedroom: 'Bedroom',
      outdoor: 'Outdoor',
      'by-collection': 'By Collection',
    };
    return tabMap[tab] || 'Living Room';
  };

  const activeTabDisplay = getActiveTabDisplay(activeTab);

  // 处理标签页切换
  const handleTabChange = (tabValue: string) => {
    const segments = pathname.split('/');
    segments[segments.length - 1] = tabValue;
    const newPath = segments.join('/');
    // 发送页面浏览事件，使用新的路径
    dispatch(
      trackCommonPageViewEvent({
        pageName: WEB_PAGE_NAMES.SHOP_THE_LOOK_PAGE,
        customPageContent: tabValue === 'by-collection' ? 'collection' : tabValue,
        customPageProduct: tabValue === 'by-collection' ? 'collection' : tabValue,
      })
    );

    router.push(newPath);
  };
  return (
    <>
      <GeneralBreadcrumbs
        breadcrumbs={[
          {
            label: `Shop The Look - ${activeTabDisplay}`,
            link: `/sg/shop-the-look/${activeTab}`,
          },
        ]}
        noLeftPadding={true}
      />
      <Stack>
        <Container>
          <Stack alignItems="center" sx={(theme) => ({ marginTop: theme.spacing(8), mb: theme.spacing(15) })}>
            <Typography level="h1" sx={(theme) => ({ mb: theme.spacing(8) })}>
              Shop The Look
            </Typography>
            <Stack
              sx={{
                width: '100%',
                alignItems: 'center',
                ...(!desktop && {
                  overflowX: 'scroll',
                  overflowY: 'hidden',
                  alignItems: 'flex-start',
                  // 隐藏滚动条但保持滚动功能
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE and Edge
                }),
              }}
            >
              <ButtonGroup
                sx={(theme) => ({
                  gap: desktop ? theme.spacing(6) : theme.spacing(2),
                  flexWrap: 'nowrap', // 防止换行
                  button: {
                    borderRadius: `${theme.spacing(2)} !important`,
                    whiteSpace: 'nowrap', // 防止按钮内文字换行
                    minWidth: 'auto', // 移除最小宽度限制
                  },
                })}
              >
                {tabList.map((tab) => (
                  <Button
                    variant="outlined"
                    key={tab.value}
                    onClick={() => handleTabChange(tab.value)}
                    sx={(theme: any) => ({
                      textTransform: 'uppercase !important',
                      fontFamily: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback)`,
                      fontSize: {
                        xs: '12px',
                        md: '14px',
                      },
                      letterSpacing: '0.1em',
                      whiteSpace: 'nowrap', // 确保按钮文字不换行
                      flexShrink: 0, // 防止按钮被压缩
                      ...(activeTab === tab.value && {
                        backgroundColor: theme.palette.brand.maroonVelvet[500],
                        color: theme.palette.brand.warmLinen[500],
                      }),
                      ...(!desktop && {
                        padding: `${theme.spacing(2)} ${theme.spacing(3)} !important`, // 减少移动端padding
                      }),
                    })}
                  >
                    {tab.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Stack>
          </Stack>
        </Container>
      </Stack>
    </>
  );
};

export { ShopTheLookTopBar };
