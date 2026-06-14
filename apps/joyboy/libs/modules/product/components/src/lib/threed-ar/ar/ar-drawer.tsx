'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Drawer,
  Typography,
  Stack,
  useBreakpoints,
  Modal,
  ModalDialog,
  ModalClose,
  Card,
  Link,
  DialogTitle,
  DialogContent,
  Button,
} from '@castlery/fortress';
import { SketchfabAPI, VariantInfo } from '@castlery/modules-product-domain';
import { ARErrorModal } from './ar-error';
import { useCompatibility } from '../../../hooks/use-compatibility';
import { useARModel } from '../../../hooks/use-ar-model';
import { FortressImage } from '@castlery/shared-components';
import { QRCodeSVG } from 'qrcode.react';
import { useScrollLock } from '@castlery/utils';
import { logger } from '@castlery/observability/client';

interface ARDrawerProps {
  open: boolean;
  onClose: () => void;
  url: string;
  uid: string;
  api: SketchfabAPI | null;
  variantInfo?: VariantInfo;
  onBack?: () => void;
  onStartAR?: (modelId: string) => void;
  onError?: (message: string) => void;
}

// 主 AR Drawer 组件
export const ARDrawer: React.FC<ARDrawerProps> = ({
  open,
  onClose,
  url,
  uid,
  api,
  variantInfo,
  onBack,
  onStartAR,
  onError,
}) => {
  const [modelUrl, setModelUrl] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { desktop, mobile, tablet } = useBreakpoints();
  const { isIOS, isAndroid } = useCompatibility();
  const { loading: arLoading, error: arError, getARModelUrl } = useARModel();

  // 格式化变体信息用于 AR 链接
  const variantInfoFormat = useMemo(() => {
    if (!variantInfo) return '';

    const { checkoutTitle, checkoutSubtitle, price } = variantInfo;
    if (isIOS) {
      return encodeURIComponent(`checkoutTitle=${checkoutTitle}&checkoutSubtitle=${checkoutSubtitle}&price=${price}`);
    }
    if (isAndroid) {
      return `title=${checkoutSubtitle}&link=${url}`;
    }
    return '';
  }, [variantInfo, url, isIOS, isAndroid]);

  // 检测 iOS AR Quick Look 支持
  const detectiOSARQuickLook = useCallback(() => {
    if (typeof document === 'undefined') return false;
    const anchor = document.createElement('a');
    return anchor.relList.supports('ar');
  }, []);

  // 启动 AR 功能
  const handleStartAR = useCallback(() => {
    onClose();
    onStartAR?.(uid); // 触发追踪事件

    if (isIOS && !detectiOSARQuickLook()) {
      setShowErrorModal(true);
      return;
    }

    if (!modelUrl) {
      try {
        // 使用 Sketchfab API 启动 AR
        if (api && typeof api.startAR === 'function') {
          try {
            api.startAR();
            if (process.env.NODE_ENV === 'development') {
              console.log('Starting AR');
            }
          } catch (startARError) {
            logger.error('Failed to start AR with Sketchfab API', { error: startARError, modelId: uid });
            setShowErrorModal(true);
          }
        }
      } catch (err) {
        logger.error('AR initialization error', { error: err, modelId: uid });
        setShowErrorModal(true);
      }
    }
  }, [api, modelUrl, onClose, onStartAR, uid, isIOS, detectiOSARQuickLook]);

  // 关闭 drawer
  const handleClose = useCallback(() => {
    onClose();
    if (!desktop && typeof window !== 'undefined') {
      // 清除 URL hash
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, [onClose, desktop]);

  // 获取 AR 模型 URL
  useEffect(() => {
    if (!uid || (!isIOS && !isAndroid)) return;

    const platform = isAndroid ? 'android' : 'ios';

    const fetchModelUrl = async () => {
      try {
        const url = await getARModelUrl(uid, platform);
        if (url) {
          setModelUrl(url);
        } else if (arError) {
          logger.error('Failed to fetch AR model URL', { error: arError, modelId: uid, platform });
          onError?.(arError);
        }
      } catch (error) {
        logger.error('Error fetching AR model URL', { error, modelId: uid, platform });
      }
    };
    if (open) {
      fetchModelUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, isIOS, isAndroid, open]);

  useScrollLock(open);

  // 移动端和平板端启动按钮作为 ActionsChildren
  const StartButton = useCallback(() => {
    return mobile || tablet ? (
      <Button
        variant="primary"
        onClick={handleStartAR}
        sx={{
          width: '100%',
        }}
      >
        {isIOS && (
          <Link
            rel="ar"
            href={`${modelUrl}#allowsContentScaling=0`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
            }}
          >
            <FortressImage src="" alt="ar quick look" sx={{ display: 'none' }} />
            Start
          </Link>
        )}

        {isAndroid && (
          <Link
            rel="ar"
            href={`intent://arvr.google.com/scene-viewer/1.0?file=${modelUrl}&resizable=false&${variantInfoFormat}&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${url}%23web-ar-not-supported;end;`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
            }}
          >
            <FortressImage src="" alt="ar quick look" sx={{ display: 'none' }} />
            Start
          </Link>
        )}

        {!isIOS && !isAndroid && 'Start'}
      </Button>
    ) : undefined;
  }, [isIOS, isAndroid, modelUrl, variantInfoFormat, url, handleStartAR, mobile, tablet]);

  return (
    <>
      <Drawer
        anchor={desktop ? 'right' : 'bottom'}
        open={open}
        size="md"
        onClose={handleClose}
        disableScrollLock={true}
        sx={{
          ...(!desktop && {
            '--Drawer-verticalSize': '85vh',
          }),
          zIndex: 20000,
        }}
        // ActionsChildren={DrawerActionsChildren}
      >
        <DialogTitle component={Box}>
          <Typography level="h3">View in room with AR</Typography>
          <ModalClose />
        </DialogTitle>
        <DialogContent
          sx={{
            px: 6,
          }}
        >
          <Stack gap={3}>
            {desktop && (
              <Box
                sx={{
                  margin: mobile ? '36px auto' : '40px auto',
                  textAlign: 'center',
                  '& svg': {
                    width: '160px',
                    height: '160px',
                  },
                }}
              >
                <QRCodeSVG value={`${url}#ar-via-qr-code`} />
              </Box>
            )}
            <Stack gap={2}>
              <Typography level="body2">
                See this product in your room using Augmented Reality (AR) technology.
                <br />
              </Typography>

              <Typography level="body2">
                {desktop
                  ? 'Scan the QR code with your smart device and allow camera access to start.'
                  : 'Allow camera access to start.'}
              </Typography>

              {(mobile || tablet) && (
                <Typography
                  level="body2"
                  sx={{
                    fontStyle: 'italic',
                  }}
                >
                  *Color shown is for AR Display only
                </Typography>
              )}
            </Stack>

            <FortressImage
              src="https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1657853428/static/web-ar/AR-prompt.jpg"
              alt="AR prompt"
            />
            {StartButton()}
          </Stack>
        </DialogContent>
      </Drawer>

      {/* AR 错误模态框 */}
      <ARErrorModal
        open={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          onBack?.();
        }}
      />
    </>
  );
};
