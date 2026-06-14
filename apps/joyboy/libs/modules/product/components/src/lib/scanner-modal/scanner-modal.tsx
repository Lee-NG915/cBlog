'use client';
import { useEffect, useState } from 'react';
import Scanner from '../scanner/scanner';
import { useLazyGetProductBySlugFromScannerQuery } from '@castlery/modules-product-domain';
import { useParams, useRouter } from 'next/navigation';

/* eslint-disable-next-line */
export interface ScannerModalProps {
  open: boolean;
  onClose: (err?: string) => void;
  onError?: (err: string) => void;
}

export function ScannerModal(props: ScannerModalProps) {
  const { open, onClose, onError } = props;
  const [start, setStart] = useState(true);
  const [decodedSlug, setDecodedSlug] = useState('');
  const router = useRouter();
  const params = useParams();
  const [getProductBySlugFromScanner] = useLazyGetProductBySlugFromScannerQuery();
  const [hasFinished, setHasFinished] = useState(false);
  // const  { currentData, isFetching }  = useGetProductBySlugFromScannerQuery();
  useEffect(() => {
    if (decodedSlug.length > 0) {
      getProductBySlugFromScanner(decodedSlug).then((res) => {
        const { isSuccess, error } = res;
        if (isSuccess) {
          setStart(false);
          onClose();
          setHasFinished(true);
          router.push(`/${params?.locale}/products/${decodedSlug}`);
        } else {
          if (error) {
            if (error?.data?.errors[0]?.detail) {
              setStart(false);
              setHasFinished(true);
              if (onError) {
                onError(error?.data?.errors[0]?.detail);
              }
              onClose();
            }
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedSlug]);
  useEffect(() => {
    if (open) {
      setStart(true);
    }
  }, [open]);
  // useEffect(() => {
  //   if (open) {
  //     setDecodedSlug('jonathan-sofa');
  //   }
  // }, [open]);
  const handleSuccess = (decodedText: string) => {
    console.log('🚀 ~ handleSuccess ~ decodedText:', decodedText);
    setStart(false);
    setDecodedSlug(decodedText);
    // handleValidProduct(decodedText);
  };
  const handleError = (err: string) => {
    setStart(false);
    onClose(err);
  };
  if (!open) {
    return null;
  }
  return (
    <>
      <Scanner
        open={open}
        onClose={onClose}
        onSuccess={handleSuccess}
        onError={handleError}
        start={start}
        hasFinished={hasFinished}
        // refreshStart={() => setStart(true)}
      />
    </>
  );
}

export default ScannerModal;
