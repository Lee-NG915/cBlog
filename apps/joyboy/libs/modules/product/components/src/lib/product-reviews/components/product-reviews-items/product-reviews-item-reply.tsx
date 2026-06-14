'use client';

import { Box, Sheet, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { GlobalReview } from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';
import { PinchZoomViewer } from '@castlery/shared-components';
import { parseReviewsDate } from '@castlery/utils';
import { useMemo, useState } from 'react';

interface ProductReviewsItemReplyProps {
  replies: GlobalReview['replies'];
}

export const ProductReviewsItemReply = (props: ProductReviewsItemReplyProps) => {
  const { replies } = props;
  const { desktop, mobile } = useBreakpoints();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayReply = useMemo(() => {
    return replies?.length > 0 ? replies[0] : null;
  }, [replies]);
  if (!displayReply) {
    return null;
  }
  return (
    <Sheet
      sx={(theme) => ({
        width: '100%',
        backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
        padding: theme.spacing(4),
        marginTop: mobile ? theme.spacing(4) : theme.spacing(5),
      })}
    >
      <Stack
        direction="row"
        justifyContent={'space-between'}
        alignItems={'center'}
        mb={(theme) => (mobile ? theme.spacing(3) : theme.spacing(4))}
      >
        <Typography level="h4" sx={{ textTransform: 'capitalize' }}>
          {displayReply?.replied_by}
        </Typography>
        {displayReply?.created_at && (
          <Typography
            level="subh3"
            sx={{
              color: 'var(--fortress-palette-brand-mono-700)',
            }}
          >
            {parseReviewsDate(displayReply?.created_at)?.toUpperCase()}
          </Typography>
        )}
      </Stack>
      <Stack>
        <Typography
          level="body2"
          variant="plain"
          sx={(theme) => ({
            width: '100%',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          })}
        >
          {displayReply?.content}
        </Typography>
        {displayReply?.attachments?.length > 0 && (
          <Stack
            direction="row"
            alignItems={'center'}
            flexWrap={'wrap'}
            gap={(theme) => theme.spacing(4)}
            sx={(theme) => ({
              marginTop: mobile ? theme.spacing(3) : theme.spacing(4),
            })}
          >
            {displayReply?.attachments?.map((attachment: any, index: number) => {
              return (
                <Box
                  sx={{
                    width: '128px',
                    height: '128px',
                  }}
                >
                  <FortressImage
                    src={attachment?.url}
                    ratio={1}
                    objectFit="cover"
                    alt={displayReply?.replied_by || ''}
                    onClick={() => {
                      setCurrentIndex(index);
                      setOpen(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      transition: 'filter 0.2s ease',
                      '&:hover': {
                        filter: 'brightness(0.8)',
                      },
                    }}
                    sizes="128px"
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>
      {displayReply?.attachments?.length > 0 && (
        <PinchZoomViewer
          open={open}
          setOpen={setOpen}
          slideImages={displayReply?.attachments?.map((attachment: any) => ({
            src: attachment?.url,
            alt: `${displayReply?.replied_by || ''}`,
            width: 128,
            height: 128,
          }))}
          index={currentIndex}
        />
      )}
    </Sheet>
  );
};
