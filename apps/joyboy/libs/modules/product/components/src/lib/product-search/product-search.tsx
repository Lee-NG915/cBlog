'use client';
import React, { useState, useEffect } from 'react';
import { Card, ButtonGroup, IconButton, NiceModal, useBreakpoints, Input, Box, Stack } from '@castlery/fortress';
import { Back, Home, QrCodeScanner, Search } from '@castlery/fortress/Icons';
import { ProductSearchInput } from '../product-search-input';
import { ScannerModal } from '../scanner-modal/scanner-modal';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { clearProductList } from '@castlery/modules-product-domain';

/* eslint-disable-next-line */
export interface ProductSearchProps {}

export const ProductSearch = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const [autoCompleteValue, setAutoCompleteValue] = useState('');

  // Get search query from URL parameters
  useEffect(() => {
    const query = searchParams?.get('q') || '';
    setAutoCompleteValue(query);
  }, [searchParams]);

  const handleClickBack = () => {
    // router.back();
    window.history.back();
  };
  const handleClickHome = () => {
    dispatch(clearProductList());
    router.replace(`/${params?.locale}/products`);
  };
  const handleClickScanner = () => {
    setScannerOpen(true);
  };
  const { mobile } = useBreakpoints();
  return (
    <Card
      sx={{
        minHeight: '48px',
        p: 0,
      }}
    >
      {!mobile && (
        <ButtonGroup
          variant="plain"
          size={mobile ? 'sm' : 'lg'}
          aria-label="disabled button group"
          sx={{
            minHeight: '46px',
          }}
        >
          <IconButton disabled={false} onClick={handleClickBack}>
            <Back />
          </IconButton>
          <IconButton disabled={false} onClick={handleClickHome}>
            <Home />
          </IconButton>
          <IconButton disabled={false} onClick={handleClickScanner}>
            <QrCodeScanner />
          </IconButton>
          <ProductSearchInput onFocused={setSearchInputFocused} defaultValue={autoCompleteValue} />
        </ButtonGroup>
      )}
      {mobile && (
        <>
          {!searchInputFocused ? (
            <ButtonGroup
              variant="plain"
              size={mobile ? 'sm' : 'lg'}
              aria-label="disabled button group"
              sx={{
                minHeight: '46px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                // border: 'none !important',  // 移除ButtonGroup本身的边框
                '& > *': {
                  flexShrink: 0, // 防止按钮收缩
                  // border: 'none !important',  // 移除所有子元素的边框
                },
                '& > *:last-child': {
                  flexShrink: 1, // 允许最后一个元素（Input）收缩
                  flexGrow: 1, // 允许最后一个元素扩展
                  border: 'none !important', // 确保最后一个元素无边框
                },
              }}
            >
              <IconButton disabled={false} onClick={handleClickBack}>
                <Back />
              </IconButton>
              <IconButton disabled={false} onClick={handleClickHome}>
                <Home />
              </IconButton>
              <IconButton disabled={false} onClick={handleClickScanner}>
                <QrCodeScanner />
              </IconButton>
              <Input
                sx={{
                  transition: 'all 0.15s ease-in-out',
                }}
                value={autoCompleteValue}
                variant="plain"
                startDecorator={<Search />}
                placeholder="Search products"
                onFocus={() => setSearchInputFocused(true)}
                onClick={() => setSearchInputFocused(true)}
                readOnly
              />
            </ButtonGroup>
          ) : (
            <ProductSearchInput
              onFocused={setSearchInputFocused}
              onValueChange={setAutoCompleteValue}
              defaultValue={autoCompleteValue}
            />
          )}
        </>
      )}
      <ScannerModal
        open={scannerOpen}
        onClose={(err) => {
          setScannerOpen(false);
          if (err) {
            setErrMsg(err);
            setModalOpen(true);
          }
        }}
        onError={(err) => {
          setErrMsg(err);
          setModalOpen(true);
        }}
      />
      <NiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        danger={true}
        title="Error"
        desc={errMsg}
        showCancelBtn={false}
        showConfirmBtn={false}
      />
    </Card>
  );
};

export default ProductSearch;
