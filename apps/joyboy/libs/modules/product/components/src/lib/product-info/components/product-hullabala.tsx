'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Box, Stack, Typography, Link, useBreakpoints, Theme, Sheet } from '@castlery/fortress';
import { useAppSelector, useAppDispatch } from '@castlery/shared-redux-store';
import { selectVariant, setHullabalaExperience } from '@castlery/modules-product-domain';
import { basePageConfig, EcEnv, HULLA_EXPERIENCE_LABEL } from '@castlery/config';
import { CustomLink, FortressImage } from '@castlery/shared-components';
import { FortressVideo } from '@castlery/shared-components';
import { hintegrateLoader } from '@castlery/utils';
import { ArrowRight } from '@castlery/fortress/Icons';
import { logger } from '@castlery/observability/client';
import { ModularTool, NewRoomTool } from '@castlery/types';
import { EVENT_PDP_HULLABALA_BANNER } from '@castlery/modules-tracking-services';

// 背景图片配置
const blankBackgrounds = {
  SG: 'https://res.cloudinary.com/castlery/image/upload/v1684378872/static/room-designer/banner_background_sg.jpg',
  AU: 'https://res.cloudinary.com/castlery/image/upload/v1684379481/static/room-designer/banner_background_au.jpg',
  US: 'https://res.cloudinary.com/castlery/image/upload/v1684379485/static/room-designer/banner_background_us.jpg',
  CA: 'https://res.cloudinary.com/castlery/image/upload/v1684379485/static/room-designer/banner_background_us.jpg',
  UK: 'https://res.cloudinary.com/castlery/image/upload/v1684379485/static/room-designer/banner_background_us.jpg',
} as const;

export const ProductHullabala = () => {
  const { desktop, mobile } = useBreakpoints();
  const variant = useAppSelector(selectVariant);
  const dispatch = useAppDispatch();
  // 状态管理
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [modularTool, setModularTool] = useState<ModularTool>({});
  const [newRoomTool, setNewRoomTool] = useState<NewRoomTool>({});
  const [modularShow, setModularShow] = useState(false);
  const [newRoomShow, setNewRoomShow] = useState(false);
  const [observeOnce, setObserveOnce] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const defaultBackgrounds = useMemo(() => {
    return {
      SG: desktop
        ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_sg.png'
        : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_sg_mobile.png',
      AU: desktop
        ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_au.png'
        : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_au_mobile.png',
      US: desktop
        ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_us.png'
        : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_us_mobile.png',
      CA: desktop
        ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_us.png'
        : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_us_mobile.png',
      UK: desktop
        ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_us.png'
        : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_us_mobile.png',
    };
  }, [desktop]);

  const tagValue = useMemo(() => {
    const {
      furniture_tool_url,
      modular_tool_url,
      configurator_tool_banner_desktop,
      configurator_tool_banner_mobile,
      room_designer_banner_desktop,
      room_designer_banner_mobile,
    } = variant || {};

    if (modular_tool_url && configurator_tool_banner_desktop && configurator_tool_banner_mobile) {
      return 'configurator_tool';
    }
    if (furniture_tool_url && room_designer_banner_desktop && room_designer_banner_mobile) {
      return 'room_designer';
    }
    return 'room_designer';
  }, [variant]);

  // 检查产品是否在体验中存在
  const checkProduct = useCallback(
    (productId: string, variantId: number) => {
      const roomDesignerExperienceLabel = HULLA_EXPERIENCE_LABEL[EcEnv.NEXT_PUBLIC_COUNTRY];
      if (typeof window !== 'undefined' && window.HIntegrate) {
        window.HIntegrate.getProductInExperience(roomDesignerExperienceLabel, productId)
          .then((productResult: any) => {
            setIsLoaded(true);
            const exists = !!productResult;
            const image = productResult?.image || undefined;
            setIsExist(exists);
            setImageSrc(image || null);

            // 存储到 Redux，供其他组件使用
            dispatch(
              setHullabalaExperience({
                variantId,
                exists,
                image,
                isLoaded: true,
              })
            );
          })
          .catch((err: any) => {
            logger.error('HIntegrate error', { error: err });
            setIsLoaded(true);
            setIsExist(false);
            setImageSrc('');

            // 存储错误状态到 Redux
            dispatch(
              setHullabalaExperience({
                variantId,
                exists: false,
                isLoaded: true,
              })
            );
          });
      }
    },
    [dispatch]
  );

  // 初始化 HIntegrate 脚本
  useEffect(() => {
    if (!variant?.id) return;

    let isMounted = true;

    // 使用统一的脚本加载器，确保只加载一次
    hintegrateLoader
      .load()
      .then(() => {
        if (isMounted && variant?.id) {
          checkProduct(variant.id.toString(), variant.id);
        }
      })
      .catch((err) => {
        logger.error('Failed to load HIntegrate script', { error: err });
        setIsLoaded(true);
        setIsExist(false);
      });

    return () => {
      isMounted = false;
    };
  }, [checkProduct, variant?.id]);

  // 处理 variant 变化，设置工具状态
  useEffect(() => {
    if (!variant) return;

    const {
      furniture_tool_url,
      modular_tool_url,
      configurator_tool_banner_desktop,
      configurator_tool_banner_mobile,
      room_designer_banner_desktop,
      room_designer_banner_mobile,
    } = variant;

    const configuratorToolBannerDesktop = configurator_tool_banner_desktop?.path
      ? {
          videoPath: configurator_tool_banner_desktop.path,
        }
      : configurator_tool_banner_desktop?.links?.large || '';
    const configuratorToolBannerMobile = configurator_tool_banner_mobile?.path
      ? {
          videoPath: configurator_tool_banner_mobile.path,
        }
      : configurator_tool_banner_mobile?.links?.large || '';

    const roomDesignerBannerDesktop = room_designer_banner_desktop?.path
      ? {
          videoPath: room_designer_banner_desktop.path,
        }
      : room_designer_banner_desktop?.links?.large || '';
    const roomDesignerBannerMobile = room_designer_banner_mobile?.path
      ? {
          videoPath: room_designer_banner_mobile.path,
        }
      : room_designer_banner_mobile?.links?.large || '';

    // 设置新房间工具
    if (furniture_tool_url && roomDesignerBannerDesktop && roomDesignerBannerMobile) {
      setNewRoomTool({
        furniture_tool_url,
        roomDesignerBannerDesktop,
        roomDesignerBannerMobile,
      });
      setNewRoomShow(true);
    } else {
      setNewRoomShow(false);
    }

    // 设置模块化工具
    if (modular_tool_url && configuratorToolBannerDesktop && configuratorToolBannerMobile) {
      setModularTool({
        modular_tool_url,
        configuratorToolBannerDesktop,
        configuratorToolBannerMobile,
      });
      setModularShow(true);
    } else {
      setModularShow(false);
    }
  }, [variant]);

  // 获取图片源
  const getPictureSource = useCallback(() => {
    if (isLoaded) {
      if (!isExist) {
        return defaultBackgrounds[EcEnv.NEXT_PUBLIC_COUNTRY];
      }
    }
    return blankBackgrounds[EcEnv.NEXT_PUBLIC_COUNTRY];
  }, [defaultBackgrounds, isLoaded, isExist]);

  // 获取链接URL
  const getLinkUrl = useCallback(() => {
    if (modularShow) {
      return modularTool.modular_tool_url;
    }
    if (newRoomShow) {
      return newRoomTool.furniture_tool_url;
    }
    return `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}${basePageConfig['room-designer']}${
      isExist && variant?.id ? `?p=${variant?.id}` : ''
    }`;
  }, [modularShow, newRoomShow, isExist, variant?.id, modularTool.modular_tool_url, newRoomTool.furniture_tool_url]);

  // 点击事件处理
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      dispatch(EVENT_PDP_HULLABALA_BANNER({ action: 'click', tag: 'button_value', tagValue: tagValue }));
      setTimeout(() => {
        const url = getLinkUrl();
        if (url) {
          window.location.href = url;
        }
      }, 100);
    },
    [dispatch, tagValue, getLinkUrl]
  );

  // 渲染横幅内容
  const renderBannerContent = useCallback(() => {
    // 如果没有工具配置，显示默认背景
    if (!modularShow && !newRoomShow) {
      return (
        <FortressImage
          src={getPictureSource() || ''}
          alt="Room Designer Background"
          ratio={desktop ? 2.78 : 1.85}
          lazy={false}
          objectFit="cover"
          sizes={['0.4-md', '1-sm', '1-xs']}
        />
      );
    }

    let videoSrc = '';
    let imageSrc = '';
    let altText = '';

    // 优先显示 Modular Tool
    if (modularShow) {
      altText = 'Modular Tool';
      const bannerSource = desktop
        ? modularTool?.configuratorToolBannerDesktop
        : modularTool?.configuratorToolBannerMobile;

      if (typeof bannerSource === 'string') {
        imageSrc = bannerSource;
      } else if (bannerSource && typeof bannerSource === 'object') {
        videoSrc = bannerSource?.videoPath;
      }
    } else if (newRoomShow) {
      // 如果 Modular Tool 不可用，显示 Room Designer 工具
      altText = 'Room Designer';
      const bannerSource = desktop ? newRoomTool?.roomDesignerBannerDesktop : newRoomTool?.roomDesignerBannerMobile;
      if (typeof bannerSource === 'string') {
        imageSrc = bannerSource;
      } else if (bannerSource && typeof bannerSource === 'object') {
        videoSrc = bannerSource?.videoPath;
      }
    }

    if (imageSrc) {
      return (
        <FortressImage
          src={imageSrc}
          alt={`${altText} Background`}
          ratio={desktop ? 2.78 : 1.85}
          sizes={['0.4-md', '1-sm', '1-xs']}
        />
      );
    }

    if (videoSrc) {
      return (
        <FortressVideo
          src={videoSrc}
          muted
          loop
          autoPlay
          controls={false}
          containerConfig={{
            aspectRatio: desktop ? 2.78 : 1.6,
            objectFit: 'cover',
          }}
          videoConfig={{
            aspectRatio: desktop ? 2.78 : 1.6,
          }}
          lazyLoad={true}
          sx={{
            backgroundColor: 'transparent',
          }}
        />
      );
    }

    return null;
  }, [
    modularShow,
    newRoomShow,
    getPictureSource,
    desktop,
    modularTool?.configuratorToolBannerDesktop,
    modularTool?.configuratorToolBannerMobile,
    newRoomTool?.roomDesignerBannerDesktop,
    newRoomTool?.roomDesignerBannerMobile,
  ]);

  // 获取描述文本
  const getDescriptionText = useCallback(() => {
    if (!modularShow) {
      return "See how our furniture pairs with other pieces you've been eyeing-no heavy lifting required.";
    }
    return 'Combine different elements of your favorite furniture and create your ideal configuration.';
  }, [modularShow]);

  // 获取链接文本
  const getLinkText = useCallback(() => {
    if (!modularShow) {
      return 'Try our room designer tool';
    }
    return 'Try our configurator tool';
  }, [modularShow]);

  // Intersection Observer 处理
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          dispatch(EVENT_PDP_HULLABALA_BANNER({ action: 'impression', tag: 'button_value', tagValue: tagValue }));
          // 触发 impression 后立即断开 observer，确保只触发一次
          observer.disconnect();
          setObserveOnce(true);
        }
      });
    },
    [dispatch, tagValue]
  );

  // 设置 Intersection Observer
  useEffect(() => {
    if (!observerRef.current || observeOnce || !IntersectionObserver) return;

    const observer = new IntersectionObserver((entries) => handleIntersect(entries, observer), {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // 改为 0.5，当元素 50% 可见时触发，更容易触发
    });

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersect, observeOnce]);

  // 如果没有相关数据，不渲染组件
  if (!variant?.id) {
    return null;
  }

  return (
    <Sheet
      variant="solid"
      sx={{
        width: '100%',
        position: 'relative',
      }}
      data-panel={variant?.id}
    >
      {/* 横幅区域 */}
      <Box
        ref={observerRef}
        sx={{
          position: 'relative',
          cursor: 'pointer',
          width: '100%',
        }}
        component={CustomLink}
        href={getLinkUrl()}
        onClick={handleClick}
        aria-label={`${getLinkText()} - Click to view details`}
      >
        {renderBannerContent()}

        {!modularShow && !newRoomShow && imageSrc && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: desktop ? '7%' : '13%',
              transform: 'translateX(-50%)',
              width: desktop ? '44%' : '53%',
              border: '2px dashed #323433',
              padding: '0 2px',
            }}
          >
            <FortressImage
              src={imageSrc}
              alt="Try our Room Designer tool"
              ratio={2.5}
              sizes={['0.4-md', '1-sm', '1-xs']}
            />
            <FortressImage
              src="https://res.cloudinary.com/castlery/image/upload/v1684382730/static/room-designer/icon_drag.png"
              alt="Try our Room Designer tool - drag icon"
              sx={{
                width: '24px',
                height: '24px',
                position: 'absolute',
                left: '-12px',
                top: ' -12px',
              }}
              sizes="24px"
            />
            <FortressImage
              src="https://res.cloudinary.com/castlery/image/upload/v1684382729/static/room-designer/icon_delete.png"
              alt="Try our Room Designer tool - delete icon"
              sx={{
                width: '24px',
                height: '24px',
                position: 'absolute',
                right: '-12px',
                top: ' -12px',
              }}
              sizes="24px"
            />
          </Box>
        )}
      </Box>

      <Stack py={mobile ? 4 : 6} px={4}>
        {/* 描述文本 */}
        <Typography
          level="body2"
          sx={{
            color: 'var(--fortress-palette-neutral-plainColor)',
          }}
        >
          {getDescriptionText()}
        </Typography>

        {/* 行动按钮 */}
        <Link
          href={getLinkUrl()}
          onClick={handleClick}
          variant="primary"
          level="body2"
          endDecorator={
            <ArrowRight
              sx={{
                width: '20px',
                height: '20px',
              }}
            />
          }
          sx={(theme: Theme) => ({
            marginTop: theme.spacing(2),
          })}
        >
          {getLinkText()}
        </Link>
      </Stack>
    </Sheet>
  );
};
