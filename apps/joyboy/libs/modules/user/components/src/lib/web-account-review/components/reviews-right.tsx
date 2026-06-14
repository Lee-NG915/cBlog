'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, useBreakpoints } from '@castlery/fortress';
import type { ReviewItem } from '@castlery/types';
import { formatDate } from '@castlery/utils';
import { FortressImage } from '@castlery/shared-components';
import { PinchZoomViewer } from '@castlery/shared-components';
interface ReviewsItemProps {
  review: ReviewItem;
}

export default function ReviewsRight({ review }: ReviewsItemProps) {
  // 状态管理
  const { mobile } = useBreakpoints();

  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          // ml: mobile ? 0 : 8,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Typography level="h4">{review?.title}</Typography>
          <Typography
            level="subh3"
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(review?.updated_at)}
          </Typography>
        </Box>

        <Typography
          level="body2"
          sx={{
            textWrap: 'wrap',
            hyphens: 'auto',
            mb: mobile ? 4 : 6,
            mt: mobile ? 2 : 4,
            overflow: 'hidden',
            maxWidth: '1000px',
            wordBreak: 'break-word',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {review?.content}
        </Typography>

        <Box display={'flex'} gap={mobile ? 2 : 6} flexWrap={'wrap'} sx={{ maxWidth: '100%' }}>
          {review?.attachments?.map((attachment, index) => (
            <FortressImage
              key={index}
              ratio={1}
              objectFit={'cover'}
              src={attachment?.url}
              alt={'attachment'}
              imageWidth={'120px'}
              imageHeight={'120px'}
              sx={{
                cursor: 'zoom-in',
              }}
              onClick={() => {
                setOpen(true);
                setOpenIndex(index);
              }}
            />
          ))}
        </Box>
      </Box>
      <PinchZoomViewer
        open={open}
        setOpen={setOpen}
        slideImages={review?.attachments?.map((item) => ({
          src: item?.url,
          alt: 'attachment',
          width: 100,
          height: 100,
        }))}
        index={openIndex}
      />
    </>
  );
}
