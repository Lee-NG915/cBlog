'use client';
import { Box, Card, Typography, useBreakpoints, Tag } from '@castlery/fortress';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';
import { EmojiObjects } from '@castlery/fortress/Icons';
import { FortressImage } from '@castlery/shared-components';

const BannerVoucherCard = (item: any) => {
  return (
    <Box sx={{ width: '317px', height: 'auto', textAlign: 'center', textWrap: 'wrap' }}>
      <Card
        variant="outlined"
        sx={{
          paddingTop: '24px',
          position: 'relative',
          transition: 'opacity 0.3s ease',
          width: '317px',
          height: '204px',
          borderRadius: '8px',
          border: '1px solid var(--fortress-palette-brand-mono-200)',
          backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="114"
          height="71"
          viewBox="0 0 114 71"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <path
            d="M113.344 0.620605C101.612 40.7001 55.3801 70.6206 0.131836 70.6206L0.130859 70.6196V9.62061C0.130859 4.65004 4.1603 0.620605 9.13086 0.620605H113.344Z"
            fill="var(--fortress-palette-brand-warmLinen-500)"
          />
        </svg>

        {/* 左侧圆形装饰 */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '107px',
            width: '22.6px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            border: '1px solid var(--fortress-palette-brand-mono-300)',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-1px',
              bottom: '-1px',
              left: '-1px',
              width: '50%',
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            },
          }}
        />

        {/* 右侧圆形装饰 */}
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: '107px',
            width: '22.6px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            border: '1px solid var(--fortress-palette-brand-mono-300)',
            transform: 'translate(50%, -50%)',
            zIndex: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-1px',
              bottom: '-1px',
              right: '-1px',
              width: '50%',
              backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
            },
          }}
        />

        <Box>
          <Typography level="h1">{item.credits}</Typography>
          <Typography level="h3">Credits</Typography>
        </Box>
      </Card>
      <Typography level="subh2" sx={{ mt: 4, mb: 2 }}>
        {item.name}
      </Typography>
      <Typography level="caption1" sx={{ color: 'var(--fortress-palette-brand-mono-500)' }}>
        {item.description}
      </Typography>
    </Box>
  );
};

export const SubmitReviewBannerImage = ({
  mobile,
  tablet,
  reviewIsFiveStar,
}: {
  mobile: boolean;
  tablet: boolean;
  reviewIsFiveStar: boolean;
}) => {
  let imageUrl = 'https://res.cloudinary.com/castlery/image/upload/v1757484121/reviews_banner_xvj1pj.png';
  if (mobile) {
    imageUrl = 'https://res.cloudinary.com/castlery/image/upload/v1757484118/reviews_banner_mobile_u4anbg.png';
  } else if (tablet) {
    imageUrl = 'https://res.cloudinary.com/castlery/image/upload/v1757484125/full-width_banner_tablet_cfuhds.png';
  }
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box
        sx={{
          width: '100%',
          height: mobile ? '240px' : tablet ? '280px' : '315px',
          overflow: 'hidden',
        }}
      >
        <FortressImage
          src={imageUrl}
          alt="Submit Review Banner"
          objectFit="unset"
          imageWidth="100%"
          imageHeight={mobile ? '240px' : tablet ? '280px' : '450px'}
          lazy={false}
          ratio={mobile ? 422 / 323 : 399 / 104}
          sx={{
            width: '100%',
            // height: '100%',
            display: 'block',
            '& img': {
              objectPosition: 'center 10000%', // 调整这里
            },
          }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 1,
          width: '100%',
          padding: '0 24px',
        }}
      >
        <Typography level="h1" sx={{ color: 'var(--fortress-palette-brand-warmLinen-500)', mb: 6 }}>
          {reviewIsFiveStar ? 'Thank you for the 5-star review' : 'Real customers. Genuine feedback.'}
        </Typography>
        {!reviewIsFiveStar && (
          <Typography level="body1" sx={{ color: 'var(--fortress-palette-brand-warmLinen-500)' }}>
            Help fellow shoppers find the right product for their needs. Simply review your purchased items and earn
            discounts off your next order. Each published review earns you a voucher.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export function SubmitReviewBannerContent({ reviewIsFiveStar }: { reviewIsFiveStar?: boolean }) {
  const { mobile, tablet, desktop } = useBreakpoints();
  const { t } = useTranslation(LocalesNamespace.MODULES_USER);
  if (reviewIsFiveStar) {
    return null;
  }
  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        gap={tablet ? 4 : mobile ? 6 : 8}
        flexWrap="wrap"
        sx={{
          mobile: {
            mt: '33px',
          },
          tablet: {
            mt: '24px',
          },
          desktop: {
            mt: '40px',
          },
        }}
      >
        {t('submitReview.banner').map((item: any) => (
          <BannerVoucherCard key={item.credits} {...item} />
        ))}
      </Box>
      {mobile && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            px: {
              md: 15,
            },
          }}
        >
          <Typography level="subh2" sx={{ color: 'var(--fortress-palette-brand-mono-700)', textAlign: 'center' }}>
            Quick tip:{' '}
            <Typography
              level="body2"
              sx={{ color: 'var(--fortress-palette-brand-mono-700)', textTransform: 'none', textAlign: 'center' }}
            >
              {mobile
                ? 'Upload your best photos and include feedback such as what you like about the product and how it fits into your home interior. Remember to submit different images per product reviewed.'
                : 'Upload your best photos and share what you like about the product and how it fits your home. Submit different images for each product reviewed.'}
            </Typography>
          </Typography>
        </Box>
      )}
      {(tablet || desktop) && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Tag variant="outlined" startDecorator={<EmojiObjects />}>
            <Typography level="caption1">
              Upload your best photos and share what you like about the product and how it fits your home. Submit
              different images for each product reviewed.
            </Typography>
          </Tag>
        </Box>
      )}
    </>
  );
}
