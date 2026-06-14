'use client';

import { Stack, useBreakpoints } from '@castlery/fortress';
import { ReviewBase } from './components/ReviewBase/ReviewBase';
import { ReviewContent } from './components/ReviewContent/ReviewContent';

type SingleReviewProps = {
  user_name: string;
  rating: number;
  title: string;
  content: string;
  attachments: {
    url: string;
  }[];
  replies: {
    content: string;
    replied_by: string;
  }[];
  variant: {
    is_available: boolean;
    images: {
      links: {
        feed: string;
      };
    }[];
    product_name: string;
    product_slug: string;
    variant_option_values: {
      option_type_presentation: string;
      presentation: string;
    }[];
  };
};

const SingleReview = ({ user_name, rating, variant, title, content, attachments, replies }: SingleReviewProps) => {
  const { desktop } = useBreakpoints();
  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        padding: desktop ? theme.spacing(8) : `${theme.spacing(5)} ${theme.spacing(6)}`,
      })}
    >
      <Stack
        sx={(theme) => ({
          flexDirection: desktop ? 'row' : 'column',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.brand.mono[300]}`,
        })}
      >
        <ReviewBase user_name={user_name} rating={rating} variant={variant} />
        <ReviewContent title={title} content={content} attachments={attachments} replies={replies} />
      </Stack>
    </Stack>
  );
};

export { SingleReview };
