'use client';
import { Typography, NiceModal, Stack, Divider, Box, Button, Loading } from '@castlery/fortress';
import { currentHadConnectedReader, readerConnected } from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
// import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FortressImage } from '@castlery/shared-components';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import type { Reader } from '@castlery/types';
import { CheckCircle } from '@castlery/fortress/Icons';

/* eslint-disable-next-line */
export interface ConnectReaderProps {
  open: boolean;
  onClose: () => void;
  stripehasInit: boolean;
}

export function ConnectReader(props: ConnectReaderProps) {
  const { open, onClose, stripehasInit } = props;
  const dispatch = useAppDispatch();
  // const readers = useAppSelector(discoverReaders);
  const [connectedReader, setConnectedReader] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readers, setReaders] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [readerBeSelected, setReaderBeSelected] = useState<string>('');
  const { readerInfo } = makePersistenceHandles();
  const readerConnectStatus = useAppSelector(currentHadConnectedReader);

  useEffect(() => {
    const getDiscoverData = async () => {
      const result = await window.terminal.discoverReaders();

      return result?.discoveredReaders || [];
    };

    const handleConnectReader = async (reader: any, hasOnline: boolean) => {
      await window.terminal.disconnectReader();
      const info: { reader?: Reader; error?: { message: string } } = await window.terminal.connectReader(reader, {
        fail_if_in_use: true,
      });
      if (info?.reader) {
        setConnectedReader(info.reader.id);
        dispatch(readerConnected(info.reader.location));
      }
    };

    const reader: string | null = readerInfo.getItem();
    if (reader !== null && stripehasInit && connectedReader === '' && !hasTried) {
      setHasTried(true);
      if (reader !== null) {
        const readerData: Reader = JSON.parse(reader);
        getDiscoverData().then((result) => {
          result.forEach((item: Reader) => {
            if (item.location === readerData.location && item.status === 'online') {
              handleConnectReader(item, true);
            }
          });
        });
      }
    }
    // eslint-disable-next-line
  }, [stripehasInit, dispatch, readerConnectStatus, readerInfo, hasTried]);

  useEffect(() => {
    // init reader
    if (readerConnectStatus) {
      const reader = readerInfo?.getItem();
      if (reader) {
        const readerData: Reader = JSON.parse(reader);
        setConnectedReader(readerData.id);
      }
    } else {
      setConnectedReader('');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerConnectStatus]);

  useEffect(() => {
    if (open) {
      handleClickDiscover();
      // dispatch(callDiscoverReaders(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClickConnect = async (reader: Reader, hasOnline: boolean) => {
    setReaderBeSelected(reader.id);
    await readerInfo.setItem(JSON.stringify(reader));
    setIsConnecting(true);
    if (hasOnline) {
      const info: { reader?: Reader; error?: { message: string } } = await window.terminal.connectReader(reader, {
        fail_if_in_use: true,
      });
      setIsConnecting(false);
      if (info?.reader) {
        console.log('🚀 ~ handleClickConnect ~ info success:', info);
        setConnectedReader(info.reader.id);
        dispatch(readerConnected(info.reader.location));
      }
      if (info?.error) {
        console.log('🚀 ~ handleClickConnect ~ info error:', info);
        setReaderBeSelected('');
        dispatch(readerConnected(''));
        // 这里等待 Bahri 的 ui 设计 confirm
        console.log('====> connectReader error: ', info.error.message);
        readerInfo.removeItem();
        setErrMsg(info.error.message);
        setModalOpen(true);
      }
    } else {
      const info = await window.terminal.disconnectReader();
      readerInfo.removeItem();
      setReaderBeSelected('');
      console.log('====> disconnectReader: ', info);
      dispatch(readerConnected(''));
      setIsConnecting(false);
      setConnectedReader('');
    }
  };

  const handleClickDiscover = async () => {
    setLoading(true);
    const result = await window.terminal.discoverReaders();
    setReaders(result?.discoveredReaders || []);
    setLoading(false);
  };
  return (
    <>
      <NiceModal
        open={open}
        onClose={onClose}
        showDefaultFooter={false}
        showCloseBtn={false}
        desc={
          <Stack sx={{ px: 4 }}>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography level="h3">Connect to a reader</Typography>
              <Typography
                level="body1"
                sx={{
                  color: 'var(--fortress-palette-brand-burntOrange-500)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  handleClickDiscover();
                  // dispatch(callDiscoverReaders());
                }}
              >
                Discover
              </Typography>
            </Stack>
            <Divider sx={{ mt: 2, mb: 4 }} />
            {!loading && (
              <Stack spacing={5}>
                {readers.map((reader, index) => {
                  const statusHasOnline = reader.status === 'online';
                  const readerHadConnected = reader.id === connectedReader && readerConnectStatus;
                  return (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        padding: '10px 0',
                        // 优化 flex 布局，  image 和。label 左对齐， 按钮右对齐
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          width: '24px',
                          height: '37px',
                        }}
                      >
                        <FortressImage
                          src="https://res.cloudinary.com/castlery/image/upload/v1712744069/kavyj8msax6k6of1lwld.png"
                          alt="reader picture"
                          ratio={0.64}
                        />
                      </Box>
                      <Box sx={{ flex: 1, display: 'flex', ml: 4 }}>
                        <Typography level="body2" sx={{ textAlign: 'left', mr: 2 }}>
                          {reader.label}
                        </Typography>
                        {readerHadConnected && <CheckCircle />}
                      </Box>
                      <Button
                        variant="outlined"
                        color="neutral"
                        size="sm"
                        sx={{ width: 128 }}
                        disabled={
                          !statusHasOnline || isConnecting || (connectedReader !== reader.id && connectedReader !== '')
                        }
                        loading={isConnecting && readerBeSelected === reader.id}
                        onClick={() => {
                          handleClickConnect(reader, !readerHadConnected);
                          // if (reader.status === 'online') {
                          //   dispatch(connectReader(reader));
                          // }
                        }}
                      >
                        {readerHadConnected ? 'Disconnect' : statusHasOnline ? 'Connect' : 'Offline'}
                      </Button>
                    </Box>
                  );
                })}
              </Stack>
            )}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loading theme="dark" />
              </Box>
            )}
          </Stack>
        }
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
    </>
  );
}

export default ConnectReader;
