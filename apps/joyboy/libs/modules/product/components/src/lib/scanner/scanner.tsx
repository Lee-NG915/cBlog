'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Box, useBreakpoints, Typography, NiceModal } from '@castlery/fortress';
import { Html5Qrcode } from 'html5-qrcode';
/* eslint-disable-next-line */
export interface ScannerProps {
  open: boolean;
  start: boolean;
  onClose: () => void;
  onSuccess: (decodedText: string) => void;
  onError: (err: string) => void;
  hasFinished: boolean;
}

export function Scanner(props: ScannerProps) {
  const { open, start, onClose, onSuccess, onError, hasFinished } = props;
  const barcodeScannerRef = useRef(null);
  const [forceClose, setForceClose] = useState(false);
  const barcodeRegionId = 'barcode-scanner';
  const { mobile } = useBreakpoints();
  const html5QrCodeInstance = useRef();
  useEffect(() => {
    if (start) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          console.log('🚀 ~ Html5Qrcode.getCameras ~ devices:', devices);
          if (devices && devices.length) {
            if (barcodeScannerRef && barcodeScannerRef.current) {
              html5QrCodeInstance.current = new Html5Qrcode(barcodeRegionId);
              html5QrCodeInstance.current
                .start(
                  { facingMode: { exact: 'environment' } }, // Select back camera
                  {
                    fps: 10, // sets the framerate to 10 frame per second
                    qrbox: 250, // sets only 250 X 250 region of viewfinder to scannable, rest shaded.
                  },
                  onSuccess,
                  (err) => {
                    // parse error, ideally ignore it.
                    console.log(`Unable to start scanning, error: ${err}`);
                  }
                )
                .catch((err) => {
                  // Start failed, handle it.
                  onError(`Unable to start scanning, error: ${err}`);
                })
                .finally(() => {
                  html5QrCodeInstance.stop();
                });
            }
          }
        })
        .catch((e) => {
          onError(`Unable to start scanning, error: ${e}`);
        });
    } else if (html5QrCodeInstance.current) {
      try {
        html5QrCodeInstance.current
          .stop()
          .then(() => {
            // refreshStart();
            // alert('in here4');
            // QR Code scanning is stopped.
            console.log('QR Code scanning stopped.');
          })
          .catch((err) => {
            // Stop failed, handle it.
            console.log(`Unable to stop scanning, error: ${err}`);
          });
      } catch (err) {
        console.log(err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, forceClose]);
  useEffect(() => {
    if (hasFinished) {
      if (html5QrCodeInstance.current) {
        setTimeout(() => {
          html5QrCodeInstance.current
            .stop()
            .then(() => {
              // alert('in here4');
              // QR Code scanning is stopped.
              console.log('QR Code scanning stopped.');
              // refreshStart();
            })
            .catch((err) => {
              // Stop failed, handle it.
              console.log(`Unable to stop scanning, error: ${err}`);
            });
        }, 200);
      }
    }
    // eslint-disable-next-line
  }, [hasFinished]);
  return (
    <NiceModal
      open={open}
      onClose={() => {
        setForceClose(true);
        setTimeout(() => {
          onClose();
          // refreshStart();
        }, 100);
      }}
      showDefaultFooter={false}
      showCloseBtn={true}
      border={false}
      // sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Typography component="h2" id="modal-title" level="h4" textColor="inherit" fontWeight="lg" mb={1}>
        Scanner
      </Typography>
      <Box
        sx={{
          minWidth: mobile ? 300 : 500,
        }}
        id={barcodeRegionId}
        ref={barcodeScannerRef}
      />
    </NiceModal>
  );
}

export default Scanner;
