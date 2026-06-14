'use client';
import {
  List,
  ListItem,
  Card,
  Stack,
  Typography,
  useBreakpoints,
  typographyClasses,
  buttonClasses,
} from '@castlery/fortress';
import { type GlobalReview } from '@castlery/modules-product-domain';
import { StarRate } from '@castlery/modules-product-components';
import { CountryMapping, EcEnv } from '@castlery/config';
import { FortressImage, ScrollWrapper } from '@castlery/shared-components';
import { CmsButton } from '../cms-button/cms-button';
import { CmsText } from '../cms-text/cms-text';
import { storyblokEditable } from '@storyblok/react/rsc';
import { useParams } from 'next/navigation';
import { DtStack } from '@castlery/modules-tracking-components';
import { ReviewsModuleName } from './config';
import { ReviewsV2Storyblok } from '@castlery/types';

export interface UIContentProps {
  reviews: Array<GlobalReview>;
  blok: ReviewsV2Storyblok;
  productSlug: string;
}
export const UIContent = ({ reviews, blok, productSlug }: UIContentProps) => {
  const { region } = useParams();
  const { title, description } = blok || {};
  const { desktop, tablet } = useBreakpoints();
  const slug = productSlug;

  const btnBlok = {
    ...(blok.action_button?.[0] || {}),
    link:
      blok.action_button?.[0]?.link || `${EcEnv.NEXT_PUBLIC_ONEPIECE_HOST ?? ''}/${region}/products/${slug}#reviews`,
    text: blok.action_button?.[0]?.text || 'View more reviews',
    variant: blok.action_button?.[0]?.variant || 'secondary',
  };

  const withImages = !!reviews?.[0]?.attachments?.[0]?.url;

  return (
    <DtStack
      useImpression
      uid={blok._uid}
      componentName={ReviewsModuleName}
      {...storyblokEditable(blok)}
      key={blok._uid}
      sx={{ py: desktop ? '60px' : tablet ? 6 : 4 }}
    >
      <Stack spacing={1} sx={{ px: desktop ? 4 : 3 }}>
        <CmsText blok={title[0] || {}} />
        <CmsText blok={description[0] || {}} />
      </Stack>
      <ScrollWrapper
        stepLength={desktop ? (withImages ? 756 : 436) : 300}
        hideDesktopAction={true}
        sx={{
          px: desktop ? 4 : 3,
        }}
      >
        <List
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: desktop ? (withImages ? 3 : 4) : 2,
            p: 0,
            '&:nth-child(1)': {
              ml: '2px',
            },
          }}
        >
          {reviews.map((review, index) => (
            <ListItem
              key={index}
              sx={{ px: 0, width: withImages ? (desktop ? 740 : 292) : desktop ? 420 : tablet ? 342 : 292 }}
            >
              <ReviewItem review={review} />
            </ListItem>
          ))}
        </List>
      </ScrollWrapper>
      <Stack
        sx={{
          px: 3,
          mt: desktop ? 4 : 3,
          [`& .${buttonClasses.root}`]: {
            width: !desktop ? '100%' : 300,
            margin: 'auto',
          },
        }}
      >
        <CmsButton outerModuleName={ReviewsModuleName} blok={{ ...btnBlok }} />
      </Stack>
    </DtStack>
  );
};

export const ReviewItem = ({ review }: { review: GlobalReview }) => {
  const { title, content, user_name, country, rating, attachments } = review;
  const { desktop, tablet } = useBreakpoints();
  const hasImage = !!attachments[0]?.url;

  return (
    <Card
      orientation={desktop ? 'horizontal' : 'vertical'}
      sx={{
        width: '99.5%',
        height: '99.5%',
        borderRadius: 10,
        border: 'none',
        overflow: 'hidden',
        p: 0,
        boxSizing: 'border-box',
        gap: 0,
        boxShadow: '0px 1px 4px 0px rgba(34, 34, 34, 0.15), 0px 0px 1px 0px rgba(34, 34, 34, 0.25)',
      }}
    >
      {hasImage && (
        <FortressImage
          imageWidth={desktop ? 400 : 292}
          imageHeight={desktop ? 400 : 292}
          src={attachments[0]?.url}
          alt={'review image'}
          objectFit="cover"
          sx={{ borderRadius: 0 }}
        />
      )}

      <Stack
        sx={{
          gap: hasImage ? 1 : 2,
          py: hasImage ? (desktop ? 4 : 3) : 2,
          px: hasImage ? (desktop ? 4 : 3) : 4,
          flex: desktop ? 1 : 'none',
          [`& .${typographyClasses.root}`]: {
            wordBreak: 'break-word',
          },
        }}
      >
        <Typography
          level={!desktop ? 'h2' : hasImage ? 'h3' : 'h2'}
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
        <Typography
          level={tablet ? (hasImage ? 'body2' : 'body1') : 'body2'}
          gutterBottom
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 5,
            textOverflow: 'ellipsis',
            mb: 0,
          }}
        >
          {content}
        </Typography>
        <Stack
          sx={{
            mt: desktop && hasImage ? 1 : 0,
          }}
        >
          <Typography>{user_name}</Typography>
          <StarRate count={Number(rating)} />
          <Typography level="caption1" sx={{ color: (theme) => theme.palette.brand.charcoal[500], mt: 1 }}>
            {country ? CountryMapping[country.toLocaleUpperCase()] : ''}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};
