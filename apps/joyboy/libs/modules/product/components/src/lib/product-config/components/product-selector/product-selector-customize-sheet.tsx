'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@castlery/fortress';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectVariant, selectHullabalaExperience } from '@castlery/modules-product-domain';
import { basePageConfig, EcEnv } from '@castlery/config';
import { CustomLink } from '@castlery/shared-components';
import { DashBoardCustomize } from '@castlery/fortress/Icons';
import { CollectionItem, ModularTool, NewRoomTool } from '@castlery/types';
import { EVENT_PDP_SELECTOR } from '@castlery/modules-tracking-services';

interface ProductSelectorCustomizeSheetProps {
  collectionPage?: CollectionItem;
  categoryCount?: number;
}
export const ProductSelectorCustomizeSheet = (props: ProductSelectorCustomizeSheetProps) => {
  const { categoryCount = 0, collectionPage } = props;
  const variant = useAppSelector(selectVariant);
  const dispatch = useAppDispatch();
  const hullabalaExperience = useAppSelector(selectHullabalaExperience);
  const isExist = hullabalaExperience?.variantId === variant?.id ? hullabalaExperience?.exists ?? false : false;
  const [modularTool, setModularTool] = useState<ModularTool>({});
  const [newRoomTool, setNewRoomTool] = useState<NewRoomTool>({});
  const [modularShow, setModularShow] = useState(false);
  const [newRoomShow, setNewRoomShow] = useState(false);

  useEffect(() => {
    if (!variant) return;

    const { furniture_tool_url, modular_tool_url } = variant;

    if (furniture_tool_url) {
      setNewRoomTool({
        furniture_tool_url,
      });
      setNewRoomShow(true);
    } else {
      setNewRoomShow(false);
    }

    // 设置模块化工具
    if (modular_tool_url) {
      setModularTool({
        modular_tool_url,
      });
      setModularShow(true);
    } else {
      setModularShow(false);
    }
  }, [variant]);

  // 获取链接URL
  const getLinkUrl = useCallback(() => {
    if (modularShow && modularTool.modular_tool_url) {
      return modularTool.modular_tool_url;
    }
    if (newRoomShow && newRoomTool.furniture_tool_url) {
      return newRoomTool.furniture_tool_url;
    }
    return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['room-designer']}${
      isExist && variant?.id ? `?p=${variant?.id}` : ''
    }`;
  }, [modularShow, newRoomShow, isExist, variant?.id, modularTool.modular_tool_url, newRoomTool.furniture_tool_url]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      dispatch(EVENT_PDP_SELECTOR({ action: 'click', label: 'byo', tag: 'button_value', tagValue: 'buildyourown' }));
      setTimeout(() => {
        window.location.href = getLinkUrl();
      }, 100);
    },
    [dispatch, getLinkUrl]
  );

  if (!variant?.id) {
    return null;
  }

  return (
    <Button
      component={CustomLink}
      onClick={handleClick}
      href={getLinkUrl()}
      variant="solid"
      sx={{
        mt: 3,
        px: 4,
        py: 3,
        textDecorationColor: 'transparent',
        width: '100%',
        backgroundColor: 'var(--fortress-palette-brand-warmLinen-100)',
        height: 'auto',
        textTransform: 'none',
      }}
      {...{
        imageButtonModule: true,
      }}
    >
      <Stack direction="row" gap={3} justifyContent="flex-start" alignItems="center" sx={{ width: '100%' }}>
        <DashBoardCustomize />
        <Stack alignItems="flex-start" gap={1}>
          <Typography
            level="body2"
            variant="plain"
            sx={{
              padding: 0,
            }}
          >
            Build your own {collectionPage?.name?.split(' ')[0] || ''}
          </Typography>
          <Typography
            level="caption2"
            variant="plain"
            sx={{
              padding: 0,
            }}
          >
            choose from {categoryCount} pieces to design your own
          </Typography>
        </Stack>
      </Stack>
    </Button>
  );
};
