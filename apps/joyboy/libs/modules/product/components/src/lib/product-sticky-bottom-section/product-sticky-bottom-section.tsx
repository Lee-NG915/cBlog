'use client';
import { Stack, Typography, Button, Box, useBreakpoints } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { selectProduct } from '@castlery/modules-product-domain';
// import { EcEnv } from '@castlery/config';
// import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WebAddToCart, usePhAtcProperities } from '../web-add-to-cart/web-add-to-cart';

export function ProductStickyBottomSection() {
  const product = useAppSelector(selectProduct);
  const { desktop, tablet } = useBreakpoints();
  const [productName, setProductName] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);
  const phProps = usePhAtcProperities();

  useEffect(() => {
    if (product) {
      setProductName(product.name);
    }
  }, [product]);

  useEffect(() => {
    if (!desktop) {
      // 超出一屏显示
      const handleScroll = () => {
        if (window.scrollY > window.innerHeight) {
          setShow(true);
        } else {
          setShow(false);
        }
      };
      window.addEventListener('scroll', handleScroll); // 组件卸载时移除事件监听
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [setShow, desktop]);

  if (desktop || !productName || !show) return null;

  return (
    <>
      <Stack
        direction="row"
        sx={{
          pt: 2,
          pb: tablet ? 2 : 4,
          px: 3,
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          bottom: 0,
          left: 0,
          background: (theme) => theme.palette.background.body,
          boxShadow: '0px 0px 25px -4px rgba(34, 34, 34, 0.16)',
          zIndex: 999,
        }}
        gap={2}
      >
        <Typography
          level="subh2"
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product?.name}
        </Typography>
        <WebAddToCart
          buttonSlot={
            <Button
              sx={
                tablet
                  ? {
                      height: 52,
                      flex: 'none',
                    }
                  : {
                      flex: 'none',
                      fontSize: 'xs',
                      py: 0,
                      height: 37,
                      lineHeight: 37,
                      minHeight: 37,
                    }
              }
              {...phProps}
            >
              Add To Cart
            </Button>
          }
        />
      </Stack>
      <Box id="placeholder" sx={{ height: 80 }}></Box>
    </>
  );
}

export default ProductStickyBottomSection;
