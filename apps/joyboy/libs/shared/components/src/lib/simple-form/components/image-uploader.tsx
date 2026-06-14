'use client';

import { Stack, Typography } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import { useState, useRef, useCallback, useEffect } from 'react';

interface ImageUploaderProps {
  name: string;
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  accept?: string;
  initialImage?: string | null;
}

const ImageUploader = ({
  name,
  onImageSelect,
  onImageRemove,
  accept = 'image/*',
  initialImage,
}: ImageUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setSelectedImage(result);
          onImageSelect?.(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelect]
  );

  const handleClick = useCallback(() => {
    if (selectedImage) {
      return;
    }
    fileInputRef.current?.click();
  }, [selectedImage]);

  // 监听 initialImage 变化，恢复之前上传的图片
  // 只有当 initialImage 真正变化时才更新状态，避免闪动
  useEffect(() => {
    if (initialImage !== selectedImage) {
      setSelectedImage(selectedImage || null);
    } else {
      setSelectedImage(initialImage || null);
    }
  }, [initialImage, selectedImage]);

  return (
    <>
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileSelect} style={{ display: 'none' }} />
      <Stack
        onClick={handleClick}
        sx={(theme) => ({
          position: 'relative',
          width: '159px',
          height: '159px',
          border: selectedImage ? 'none' : `1px dashed ${theme.palette.brand.mono[300]}`,
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&:hover': {
            borderColor: theme.palette.brand.mono[400],
          },
        })}
      >
        {!selectedImage && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="65" viewBox="0 0 64 65" fill="none">
              <path
                d="M13.5999 54.5673C12.4444 54.5673 11.4444 54.1451 10.5999 53.3007C9.75547 52.4562 9.33325 51.434 9.33325 50.234V16.234C9.33325 15.034 9.75547 14.0118 10.5999 13.1673C11.4444 12.3229 12.4444 11.9007 13.5999 11.9007H35.9999V14.5673H13.5999C13.111 14.5673 12.7217 14.7229 12.4319 15.034C12.1439 15.3451 11.9999 15.7451 11.9999 16.234V50.234C11.9999 50.7229 12.1439 51.1229 12.4319 51.434C12.7217 51.7451 13.111 51.9007 13.5999 51.9007H47.6666C48.1555 51.9007 48.5555 51.7451 48.8666 51.434C49.1777 51.1229 49.3333 50.7229 49.3333 50.234V27.9007H51.9999V50.234C51.9999 51.434 51.5777 52.4562 50.7333 53.3007C49.8888 54.1451 48.8666 54.5673 47.6666 54.5673H13.5999ZM45.9999 23.1673V17.834H40.6666V15.1673H45.9999V9.83398H48.6666V15.1673H53.9999V17.834H48.6666V23.1673H45.9999ZM18.6666 45.234H43.0666L35.5333 35.1673L28.5333 44.034L23.8666 38.3673L18.6666 45.234Z"
                fill="#212121"
              />
            </svg>
            <Typography level="caption1" sx={(theme) => ({ mt: theme.spacing(2) })}>
              {name}
            </Typography>
          </>
        )}
        {selectedImage && (
          <Stack
            sx={(theme) => ({
              position: 'absolute',
              top: `-${theme.spacing(3)}`,
              right: `-${theme.spacing(3)}`,
              backgroundColor: theme.palette.brand.warmLinen[200],
              borderRadius: theme.spacing(3),
              width: theme.spacing(6),
              height: theme.spacing(6),
              cursor: 'pointer',
              justifyContent: 'center',
              alignItems: 'center',
            })}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
              onImageRemove?.();
            }}
          >
            <Close sx={{ width: '14px', height: '14px', color: '#D25C1B' }} />
          </Stack>
        )}
      </Stack>
    </>
  );
};

export { ImageUploader };
