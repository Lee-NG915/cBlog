import React, { useState, useCallback, useMemo } from 'react';
import { useRefinementList, useInstantSearch } from 'react-instantsearch';
import { Switch, Typography, Stack, Divider, Box, useBreakpoints } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectedCurrentZipcode } from '@castlery/modules-user-domain';
import { FeatureManager, FeatureName } from '@castlery/monorepo-features';
import { NextFortressLink, ShippingLocationModal } from '@castlery/shared-components';
import { FACET_ATTRIBUTE } from '../config';
import { EVENT_PLP_FILTER } from '@castlery/modules-tracking-services';
import { quickshipZipcodeSelectorClickedEvent } from '@castlery/modules-search-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { useQueryString } from '../config/search-context';

export function QuickshipToggleRefinement() {
  const dispatch = useAppDispatch();
  const { desktop } = useBreakpoints();
  const currentZipcodeFromState = useAppSelector(selectedCurrentZipcode);
  const [openShippingLocationModal, setOpenShippingLocationModal] = useState(false);

  // 🔧 Get queryString from server configuration (e.g., from PLP settings in Storyblok)
  const queryString = useQueryString();

  // 🔧 Check if quickship is locked by server configuration
  // If queryString contains "quickship=true", the toggle is permanently ON and disabled
  const isQuickshipLocked = useMemo(() => {
    return queryString?.includes('quickship=true') ?? false;
  }, [queryString]);

  // 使用 InstantSearch 原生的 useRefinementList hook 处理 variants.in_stock_regions.raw
  // 现在我们使用特殊标记 __QUICKSHIP_ENABLED__ 来表示 quickship 功能已启用
  const { items, refine, canRefine } = useRefinementList({
    attribute: FACET_ATTRIBUTE.in_stock_regions,
    limit: 1000, // 确保能获取到所有可能的值
  });

  // Get search status and UI state to handle loading state and refinement status
  const { status, indexUiState } = useInstantSearch();

  // 🔧 Determine the checked state:
  // - If locked by queryString, always true
  // - Otherwise, read from indexUiState
  const refinementList = indexUiState.refinementList || {};
  const refinedValues = refinementList[FACET_ATTRIBUTE.in_stock_regions] || [];
  const isRefinedFromState = refinedValues.includes('__QUICKSHIP_ENABLED__');
  const isChecked = isQuickshipLocked ? true : isRefinedFromState;

  // 🔧 Warning: If quickship is active in URL but no zipcode, the filter won't actually apply
  // This can happen when user accesses URL like ?quickship=true without setting zipcode first
  // Server will remove the quickship marker to prevent "no results" error
  const hasQuickshipWithoutZipcode = isRefinedFromState && !currentZipcodeFromState && !isQuickshipLocked;

  // Debug: Log UI state to help diagnose quickship issues
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 QuickshipToggle Debug:', {
      queryString,
      isQuickshipLocked,
      refinedValues,
      isRefinedFromState,
      isChecked,
      hasZipcode: !!currentZipcodeFromState,
      zipcode: currentZipcodeFromState,
      hasQuickshipWithoutZipcode,
    });
  }

  // Log warning when quickship is in URL but won't actually filter (no zipcode)
  if (hasQuickshipWithoutZipcode) {
    console.warn('⚠️ Quickship in URL but no zipcode - server will remove the filter to show results');
  }

  // Check if search is loading
  const isSearching = status === 'loading' || status === 'stalled';

  const trackQuickShipFilter = useCallback(
    (zipcode: string) => {
      dispatch(EVENT_PLP_FILTER({ action: 'Quickship Filter', label: zipcode }));
    },
    [dispatch]
  );

  // Switch 的处理逻辑：基于开关状态决定是否应用 refine
  const handleToggle = useCallback(
    (checked: boolean) => {
      // 🔧 If quickship is locked by queryString, don't allow toggle
      if (isQuickshipLocked) {
        return;
      }

      // 只有当用户有有效的 zipcode 时才允许操作
      if (currentZipcodeFromState) {
        if (checked) {
          // 开启 switch：如果当前没有 refine，则添加特殊标记
          if (!isRefinedFromState) {
            refine('__QUICKSHIP_ENABLED__');
            trackQuickShipFilter(currentZipcodeFromState);
          }
        } else {
          // 关闭 switch：如果当前有 refine，则移除特殊标记
          if (isRefinedFromState) {
            refine('__QUICKSHIP_ENABLED__');
          }
        }
      }
    },
    [currentZipcodeFromState, isRefinedFromState, refine, trackQuickShipFilter, isQuickshipLocked]
  );

  // 处理 modal 关闭事件
  const handleModalClose = useCallback(() => {
    setOpenShippingLocationModal(false);
    // Modal 关闭时不需要手动触发刷新，因为 ruleContexts 中的 currentZipcode 会自动更新并触发搜索
  }, []);

  // 处理位置变更成功后自动激活 quickship
  const handleLocationChangeSuccess = useCallback(
    (zipcode: string) => {
      // 🔧 If quickship is locked, don't auto-activate (it's already locked)
      if (isQuickshipLocked) {
        // Just track the zipcode change, quickship state is fixed
        trackQuickShipFilter(zipcode);
        return;
      }

      // 如果当前 quickship 未激活，则自动激活
      // 如果已激活，zipcode 变化会由 useEffect 自动处理重新转换
      if (!isRefinedFromState) {
        refine('__QUICKSHIP_ENABLED__');
      }
      trackQuickShipFilter(zipcode);
    },
    [isRefinedFromState, refine, trackQuickShipFilter, isQuickshipLocked]
  );

  const displayZipcode = currentZipcodeFromState;
  // 🔧 Disable conditions:
  // - If quickship is locked by queryString (user can only change zipcode)
  // - If no zipcode is available
  // - If search is in progress
  const isDisabled = isQuickshipLocked || !currentZipcodeFromState || isSearching;

  return (
    <>
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: {
            xs: 'flex-start', // 移动端靠左对齐，让元素靠在一起
            md: 'space-between', // 桌面端两端对齐
          },
          width: '100%',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Switch
            size="sm"
            checked={isChecked}
            onChange={(event) => handleToggle(event.target.checked)}
            disabled={isDisabled}
          />
          <Typography level="subh2">{`Quickship to`}</Typography>
        </Stack>

        <NextFortressLink
          component={Box}
          variant="primary"
          level="subh2"
          sx={{
            letterSpacing: desktop && displayZipcode && displayZipcode.length > 5 ? -0.1 : 1,
            ml: {
              xs: 1, // 移动端添加左边距，与 "Quickship to" 保持适当间距
              md: 0, // 桌面端不需要额外边距
            },
          }}
          onClick={() => {
            setOpenShippingLocationModal(true);
            dispatch(quickshipZipcodeSelectorClickedEvent());
          }}
        >
          {displayZipcode}
        </NextFortressLink>
      </Stack>
      <ShippingLocationModal
        open={openShippingLocationModal}
        onClose={handleModalClose}
        onLocationChangeSuccess={handleLocationChangeSuccess}
        source="Quickship"
      />
    </>
  );
}

export function QuickshipToggleRefinementWrapper() {
  // Check if quickship feature is enabled for current channel/region
  const featureManager = FeatureManager.getInstance();
  const isQuickshipFeatureEnabled = featureManager.isFeatureEnabled(FeatureName.QUICKSHIP);

  if (!isQuickshipFeatureEnabled) return null;
  return (
    <>
      <QuickshipToggleRefinement />
      <Divider
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },
          my: {
            xs: 0,
            md: 4,
          },
        }}
      />
    </>
  );
}
