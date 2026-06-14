import React, { useState, useEffect } from 'react';
import { Box, Typography } from 'fortress';
import { ReplyItemType } from 'fortress/GlobalReview/types/types';
import ReviewImageList from '../ReviewImageList/ReviewImageList';

type ReplyDecoratorProps = {
  replied_by: string;
  content: string;
  attachmentsReal: { image_url: string; clickHandler?: () => void }[];
};

type ReviewReplyProps = {
  replies: ReplyDecoratorProps[];
};

const ReviewReply = ({ replies }: ReviewReplyProps) => {
  const [reply, setReply] = useState<ReplyDecoratorProps | null>(null);
  useEffect(() => {
    if (replies.length > 0) {
      setReply(replies[0]);
    }
  }, [replies]);
  if (replies.length === 0) {
    return null;
  }
  return (
    <Box
      sx={() => ({
        boxSizing: 'border-box',
        position: 'relative',
        marginTop: '10px',
        backgroundColor: 'rgba(179, 159, 136, 0.1)',
        padding: '30px 20px',
      })}
    >
      <Box
        sx={() => ({
          position: 'absolute',
          width: '20px',
          height: '9px',
          left: '20px',
          bottom: 'calc(100% - 0.1px)',
          backgroundColor: 'inherit',
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
        })}
      />
      <Typography
        sx={(theme) => ({
          color: theme.palette.brand.charcoal[900],
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: 1,
        })}
      >
        {reply?.replied_by}
      </Typography>
      <Typography
        sx={(theme) => ({
          color: theme.palette.brand.charcoal[900],
          fontSize: '0.875rem',
        })}
      >
        {reply?.content}
      </Typography>
      <ReviewImageList imageList={reply?.attachmentsReal || []} title={reply?.replied_by || ''} />
    </Box>
  );
};

export default ReviewReply;
