'use client';

import {
  Box,
  Typography,
  Loading,
  Accordion,
  AccordionGroup,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  useBreakpoints,
  useNiceModal,
} from '@castlery/fortress';
import { selectedCustomerReviews, useGetCustomerReviewsQuery } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import ReviewsItem from './reviews-item';
import { CustomLink } from '@castlery/shared-components';

const reviewGuidelines = [
  'Each review submitted is subject to approval to be published before credits are awarded.',
  'Each review submitted must be unique. The same text and image cannot be submitted for more than 1 review. If any image review submitted contains images already submitted in other reviews, that image review may not be approved or may only be given a text review reward (30 credits). Note: These image reviews must not violate any other guidelines.',
  'Image reviews must be original and feature your purchased item(s) in your interior space.',
  'Image reviews containing images taken from any Castlery marketing material may not be approved.',
  'Image reviews require at least 2 business days for approval.',
  "Castlery reserves the right not to publish reviews with content that is deemed irrelevant (not directly pertaining to the product), taken from Castlery's marketing material, fake, offensive, or defamatory.",
  'Castlery reserves the right to remove content (images or text) from an existing published review if later found to be violating any of our review guidelines.',
  "Castlery's decision with regards to submitted reviews is final.",
  'Castlery reserves the right to reject any review, withdraw or amend awarded credits for any customer subsequently found to be disqualified for any reason.',
  "By submitting a review (text and/or images), you agree to give consent for the review and its images to be used in Castlery's marketing channels and content.",
  'Castlery reserves the right to modify these guidelines at any time without prior notice.',
];

// Review Reward Terms & Conditions from the image
const reviewRewardTerms: (string | React.ReactNode)[] = [
  '30 credits will be awarded for a text review and 75 credits will be awarded for a photo review.',
  'Issued credits are non-transferable and are valid for 1 year from date of issue unless stated.',
  <>
    Credits can be redeemed for vouchers, more details can be found <CustomLink linkKey="promo-terms">here</CustomLink>.
  </>,
  'Redeemed voucher can only be used per single order.',
  'Redeemed voucher is for one-time use only.',
  'Redeemed voucher can only be used with the minimum spend requirement stated.',
  'Redeemed voucher is not applicable for shipping fees and/or other charges.',
  'Redeemed voucher cannot be used with any other vouchers/promo codes.',
  'Redeemed voucher cannot be applied to past invoices.',
];

export const ReviewGuide = () => (
  <>
    <AccordionGroup variant="plain">
      <Accordion onChange={() => {}}>
        <AccordionSummary>
          <Typography level="h5">Review Guidelines</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List marker="disc">
            {reviewGuidelines.map((guideline) => (
              <ListItem key={guideline} sx={{ py: 0 }}>
                <Typography level="caption2">{guideline}</Typography>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion onChange={() => {}}>
        <AccordionSummary>
          <Typography level="h5">Review Reward Terms & Conditions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List marker="disc">
            {reviewRewardTerms.map((term: string | React.ReactNode, index: number) => (
              <ListItem key={index}>
                <Typography level="caption2">{typeof term === 'string' ? term : <>{term}</>}</Typography>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  </>
);

// Review Guidelines from the image

export const ReviewsContent = () => {
  const [modal, modalContextHolder] = useNiceModal();
  // const { data, isLoading, error } = useGetReviewsQuery();
  // const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const { mobile } = useBreakpoints();
  // 每次进入页面都重新获取地址数据
  const { isLoading: queryLoading } = useGetCustomerReviewsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const reviews = useAppSelector(selectedCustomerReviews);
  const reviewsList = reviews?.results || [];
  const isEmpty = reviewsList.length === 0;

  return (
    <>
      {modalContextHolder}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Typography level="h2">My Reviews</Typography>
        <>
          {queryLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '300px',
              }}
            >
              <Loading theme="dark" />
            </Box>
          )}
          {isEmpty && !queryLoading && (
            <Box sx={{ mb: 7 }}>
              <Typography level="body1">
                You haven’t reviewed any products. Review now to earn vouchers for your next purchase!
              </Typography>
            </Box>
          )}
        </>
      </Box>

      {reviewsList && reviewsList.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: mobile ? 6 : 7, mt: mobile ? 6 : 4 }}>
          {reviewsList.map((review) => (
            <ReviewsItem key={review.id} review={review} modal={modal} />
          ))}
        </Box>
      )}

      {!queryLoading && (
        <>
          <Divider sx={{ mb: 7 }} />
          <ReviewGuide />
        </>
      )}
    </>
  );
};
