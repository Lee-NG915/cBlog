import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Link, Modal, Typography, useBreakpoints } from '@castlery/fortress';
import { DynamicModalDialog } from '@castlery/shared-fortress-client';
import { ArrowBackIosNew, ViewInAr } from '@castlery/fortress/Icons';
// import Script from 'next/script'; // 不再使用，改为动态加载
import {
  CameraPosition,
  SketchfabAPI,
  SketchfabError,
  SketchfabEvent,
  VariantInfo,
} from '@castlery/modules-product-domain';
import { useHash } from '../../../hooks/use-hash';

import { FortressImage } from '@castlery/shared-components';

interface SketchfabViewerProps {
  uid: string;
  variantInfo?: VariantInfo;
  handleThreeDView: (show: boolean) => void;
  defaultStartAR?: boolean;
  supportsAR?: boolean; // 从 gallery 传入兼容性信息
  onModelLoadTime?: (loadTime: string, modelId: string) => void;
  onARClick?: (label: string) => void;
  onARImpression?: (label: string) => void;
  onBack?: () => void;
  onError?: (message: string) => void;
  onOpenARDrawer?: () => void; // 新增：通知父组件打开 AR drawer
}

// 简化的 useInView hook
interface UseInViewOptions {
  threshold: number;
  triggerOnce: boolean;
}

type UseInViewReturn = [React.RefObject<HTMLElement>, boolean];

const useInView = ({ threshold, triggerOnce }: UseInViewOptions): UseInViewReturn => {
  const [inView, setInView] = useState<boolean>(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]: IntersectionObserverEntry[]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, triggerOnce]);

  return [ref, inView] as const;
};

export const SketchfabViewer: React.FC<SketchfabViewerProps> = ({
  uid,
  variantInfo,
  handleThreeDView,
  defaultStartAR = false,
  supportsAR = false, // 从 gallery 传入的兼容性信息
  onModelLoadTime,
  onARClick,
  onARImpression,
  onBack,
  onError,
  onOpenARDrawer,
}) => {
  const viewerIframeRef = useRef<HTMLIFrameElement>(null);
  const [viewerApi, setViewerApi] = useState<SketchfabAPI | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [initPosition, setInitPosition] = useState<CameraPosition | null>(null);

  const { desktop, mobile, tablet } = useBreakpoints();
  const initializedRef = useRef<boolean>(false); // 追踪是否已经初始化
  const propsRef = useRef({
    // 使用ref存储最新的props，避免useCallback依赖
    uid,
    desktop,
    defaultStartAR,
    variantInfo,
    onModelLoadTime,
    onARClick,
    onARImpression,
    onError,
    onBack,
    onOpenARDrawer,
  });
  const isSupportAR = supportsAR; // 使用从 props 传入的兼容性信息

  const hash = useHash();

  // 更新props ref
  useEffect(() => {
    propsRef.current = {
      uid,
      desktop,
      defaultStartAR,
      variantInfo,
      onModelLoadTime,
      onARClick,
      onARImpression,
      onError,
      onBack,
      onOpenARDrawer,
    };
  });

  const handleBack = useCallback(() => {
    if (viewerApi) {
      viewerApi.stop(() => {
        handleThreeDView(false);
        console.log('Viewer stopped');
        if (typeof window !== 'undefined') {
          // 完全移除 hash，包括 # 符号
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
        onBack?.();
      });
    } else {
      handleThreeDView(false);
      if (typeof window !== 'undefined') {
        // 完全移除 hash，包括 # 符号
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      }
      onBack?.();
    }
  }, [viewerApi, handleThreeDView, onBack]);

  const handleAR = useCallback(
    (api: SketchfabAPI | null) => {
      if (typeof window === 'undefined') return;
      const currentProps = propsRef.current;
      // 触发 AR 点击事件追踪
      currentProps.onARClick?.('view_with_ar');

      // 通过 callback 通知父组件打开 AR Drawer
      currentProps.onOpenARDrawer?.();
    },
    [] // 没有外部依赖，因为使用的是 callback
  );

  const handleCloseTip = useCallback(() => {
    setShowTip(false);
  }, []);

  const handleReset = useCallback(() => {
    if (viewerApi && initPosition) {
      const { position, target } = initPosition;
      viewerApi.setCameraLookAt(position, target, 2, (error: SketchfabError | null) => {
        if (!error) {
          console.log('Camera moved');
        }
      });
    }
  }, [viewerApi, initPosition]);

  const initializeSketchfab = useCallback(() => {
    if (!window.Sketchfab || !viewerIframeRef.current) return;

    const currentProps = propsRef.current;
    const startTime = Date.now();
    console.log(startTime, '-------startTime');

    try {
      const version = '1.12.1';
      const client = new window.Sketchfab(version, viewerIframeRef.current);
      console.log(client, '-------client');
      client.init(currentProps.uid, {
        success: (api: SketchfabAPI) => {
          api.start();
          api.addEventListener(SketchfabEvent.VIEWER_READY, () => {
            console.log('Viewer is ready');

            // 设置背景色
            const bgR = 243;
            const bgG = 243;
            const bgB = 243;
            const normalizedColor: [number, number, number] = [bgR / 255, bgG / 255, bgB / 255];
            api.setBackground({ color: normalizedColor }, (error?: SketchfabError) => {
              if (!error) {
                console.log('Background changed');
              }
            });

            const endTime = Date.now();
            const loadTime = endTime - startTime;
            console.log(loadTime, '-------Time consuming');

            const loadTimeString =
              loadTime > 1000 ? `${Math.floor(loadTime / 1000)}s${loadTime % 1000}ms` : `${loadTime % 1000}ms`;

            currentProps.onModelLoadTime?.(loadTimeString, currentProps.uid);

            setViewerApi(api);
            setInitialized(true);
            initializedRef.current = true; // 标记已初始化
            if (currentProps.defaultStartAR) {
              handleAR(api);
            }

            // 获取并设置初始相机位置
            api.getCameraLookAt((error: SketchfabError | null, camera?: CameraPosition) => {
              if (!error && camera) {
                if (currentProps.desktop) {
                  setInitPosition({
                    position: camera.position,
                    target: camera.target,
                  });
                } else {
                  const [x, y, z] = camera.position;
                  const newPosition: [number, number, number] = [x, y - 4, z];
                  api.setCameraLookAt(newPosition, camera.target, 2, (error: SketchfabError | null) => {
                    if (!error) {
                      console.log('Camera reset');
                      setInitPosition({
                        position: newPosition,
                        target: camera.target,
                      });
                    }
                  });
                }
              }
            });
          });
        },
        error: (error: SketchfabError) => {
          console.log(error);
          handleBack();
          currentProps.onError?.('3D model is not available.');
        },
        autostart: 1,
        autospin: 0.1,
        annotation_tooltip_visible: 0,
        annotations_visible: 0,
        camera: 0,
        ui_stop: 0,
        ui_animations: 0,
        ui_annotations: 0,
        ui_controls: 0,
        ui_fadeout: 0,
        ui_hint: 0,
        ui_infos: 0,
        ui_loading: 0,
        ui_watermark: 0,
        ui_ar_help: 0,
        prevent_user_light_rotation: 1,
        preload: 1,
        orbit_constraint_zoom_in: 1,
        orbit_constraint_zoom_out: currentProps.desktop ? 5 : 10,
        orbit_constraint_pitch_up: Math.PI / 2,
        orbit_constraint_pitch_down: Math.PI / 18,
      });
    } catch (error) {
      console.log(error, 'Not support');
      currentProps.onError?.('3D viewer is not supported on this device');
      handleBack();
    }
  }, [handleAR, handleBack]); // 只依赖稳定的函数

  // 动态加载 Sketchfab 脚本 - 按照原始逻辑
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.Sketchfab) {
      const sketchfabScript = document.createElement('script');
      sketchfabScript.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      document.body.appendChild(sketchfabScript);

      sketchfabScript.addEventListener('load', () => setLoaded(true));
    } else {
      // 如果已经加载过了，直接设置为已加载
      setLoaded(true);
    }
  }, []);

  // 初始化 Sketchfab
  useEffect(() => {
    if (loaded) {
      initializeSketchfab();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, desktop]);

  // 设置相机移动监听
  useEffect(() => {
    if (initialized && viewerApi) {
      const timer = setTimeout(() => {
        viewerApi.addEventListener(SketchfabEvent.CAMERA_START, () => {
          console.log('Camera is moving');
          if (showTip) {
            handleCloseTip();
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [initialized, viewerApi, showTip, handleCloseTip]);

  // URL hash 监听 - 使用 useHash hook
  useEffect(() => {
    if (!hash) {
      handleThreeDView(false);
      // TODO: 需要关闭其他模态框的逻辑 (对应原始代码的 frame.removeModal())
    } else if (hash === 'dimensions-3d') {
      // TODO: 当进入 3D 查看模式时，需要关闭其他模态框的逻辑 (对应原始代码的 frame.removeModal())
    }
  }, [hash, handleThreeDView]);

  const [arRef, arInView] = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (arInView) {
      onARImpression?.('view_with_ar');
    }
  }, [arInView, onARImpression]);

  return (
    <>
      {/* 主容器 - 对应原 .viewer */}
      <Modal
        // sx={{
        //   position: 'fixed',
        //   left: 0,
        //   top: 0,
        //   width: '100vw',
        //   height: '100%',
        //   zIndex: 10000,
        //   display: 'block',
        // }}
        sx={{
          '& .MuiModalDialog-root': {
            '--Card-padding': 0,
            // 移动端全屏优化
            ...(mobile && {
              margin: 0,
              minHeight: '100vh',
              minWidth: '100vw',
              maxHeight: '100vh',
              maxWidth: '100vw',
              borderRadius: 0,
            }),
          },
        }}
        open={true}
        data-selenium="top-layer"
      >
        <DynamicModalDialog
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <iframe
            ref={viewerIframeRef}
            className="is-modal-open"
            title="3d"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              overflow: 'hidden',
            }}
            allow="fullscreen"
            allowFullScreen={true}
          />

          {initialized ? (
            <>
              <Link
                component="button"
                variant="primary"
                startDecorator={<ArrowBackIosNew />}
                onClick={handleBack}
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                }}
              >
                Back
              </Link>

              <IconButton
                variant="image"
                onClick={handleReset}
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  sx={{
                    width: 20,
                    height: 20,
                    fill: (theme: any) => theme.palette.primary[500],
                    stroke: (theme: any) => theme.palette.primary[500],
                  }}
                >
                  <path
                    d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"
                    fill="currentColor"
                  />
                  <path
                    d="M18.76 7.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
                    fill="currentColor"
                  />
                </Box>
              </IconButton>

              {showTip && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 350,
                    height: 116,
                    position: 'absolute',
                    top: 34,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: 16,
                    lineHeight: '24px',
                    color: '#fff',
                    backgroundColor: (theme: any) => theme.palette.brand.charcoal[800],
                    opacity: 0.78,
                    '@media (max-width: 600px)': {
                      width: 300,
                      top: 64,
                    },
                  }}
                >
                  <Typography level="body2" sx={{ color: '#fff', mb: 1.5 }}>
                    Drag to rotate. Pinch{desktop && '/Scroll'} to zoom.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleCloseTip}
                    sx={{
                      border: '1px solid #fff',
                      width: 80,
                      height: 40,
                      backgroundColor: 'transparent',
                      color: '#fff',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: '#fff',
                      },
                    }}
                  >
                    OK
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
                backgroundColor: '#f1f1f1',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <FortressImage
                src="https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1657867713/static/web-ar/loading.gif"
                alt="sketchfab loading"
                sx={{
                  width: 240,
                  height: 240,
                  mixBlendMode: 'multiply',
                  transform: 'rotate(180deg)',
                }}
                {...{
                  unoptimized: true,
                }}
              />
              <Typography
                level="body1"
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                Loading 3D View...
              </Typography>
            </Box>
          )}

          {isSupportAR && initialized && (
            <Button
              {...(mobile
                ? {
                    variant: 'secondary',
                  }
                : {
                    imageButtonModule: true,
                    variant: 'solid',
                  })}
              startDecorator={<ViewInAr />}
              onClick={() => {
                handleAR(viewerApi);
              }}
              ref={arRef}
              sx={{
                position: 'absolute',
                bottom: 60,
                left: 40,
              }}
            >
              <Typography level="subh2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                View in AR
              </Typography>
            </Button>
          )}
        </DynamicModalDialog>
      </Modal>
    </>
  );
};

export default SketchfabViewer;

// client.init(uid, {
//   success: (api) => { /* 成功回调 */ },
//   error: (err) => { /* 错误回调 */ },

//   // === 基础配置 ===
//   autostart: 1,           // 页面加载完立即开始，不等用户点击播放按钮
//   autospin: 0.1,          // 自动围绕z轴旋转，数值越大转速越快，负数反向
//   camera: 0,              // 跳过初始动画，直接显示默认位置
//   preload: 1,             // 强制下载所有资源(纹理)再显示场景，防止低分辨率/缺失纹理

//   // === UI 控制 ===
//   ui_stop: 0,             // 隐藏右上角"禁用查看器"按钮
//   ui_animations: 0,       // 隐藏动画菜单和时间轴
//   ui_annotations: 0,      // 隐藏注释菜单
//   ui_controls: 0,         // 隐藏底部所有控件(帮助、设置、检查器、VR、全屏、注释、动画)
//   ui_fadeout: 0,          // 防止控件在相机移动或非活动状态时消失
//   ui_hint: 0,             // 隐藏查看器提示动画("点击并拖拽旋转")
//   ui_infos: 0,            // 隐藏顶部模型信息栏
//   ui_loading: 0,          // 隐藏查看器加载条
//   ui_watermark: 0,        // 移除 Sketchfab logo 水印
//   ui_ar_help: 0,          // 移除二维码下方的模型页面链接和加载屏幕帮助链接

//   // === 注释配置 ===
//   annotation_tooltip_visible: 0,  // 默认隐藏注释工具提示
//   annotations_visible: 0,         // 默认隐藏注释

//   // === 相机约束 ===
//   orbit_constraint_zoom_in: 1,              // 相机缩放限制(最小距离)
//   orbit_constraint_zoom_out: desktop ? 5 : 10,  // 相机缩放限制(最大距离)，移动端更大
//   orbit_constraint_pitch_up: Math.PI / 2,       // 相机向上俯仰角度限制
//   orbit_constraint_pitch_down: Math.PI / 18,    // 相机向下俯仰角度限制

//   // === 交互控制 ===
//   prevent_user_light_rotation: 1,  // 防止使用 alt + 点击/拖拽旋转灯光和环境
// });
