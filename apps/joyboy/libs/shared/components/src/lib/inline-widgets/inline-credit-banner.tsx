'use client';
import { Typography, useBreakpoints, Link, Chip, Box, chipClasses } from '@castlery/fortress';
import { ArrowForwardIos } from '@castlery/fortress/Icons';
import { useGetYotpoCustomerDetailsQuery } from '@castlery/modules-promotion-domain';
import { selectedActiveUser } from '@castlery/modules-user-domain';
import { useAppSelector } from '@castlery/shared-redux-store';
import { basePageConfig, EcEnv } from '@castlery/config';
import { selectMiniCartMode } from '@castlery/modules-cart-domain';
import { accessInPos } from '@castlery/config';
export const InlineCreditBanner = () => {
  const { desktop, mobile, tablet } = useBreakpoints();
  const customer = useAppSelector(selectedActiveUser);
  const miniCartMode = useAppSelector(selectMiniCartMode);
  const { currentData } = useGetYotpoCustomerDetailsQuery(customer?.email as string, { skip: !customer?.email });
  const pointsBalance = currentData?.points_balance;
  const hasPoints = !!pointsBalance;
  const isCompactViewport = mobile || tablet;
  const isRelativePosition = isCompactViewport || miniCartMode;
  const chipHeight = desktop ? 32 : 30;
  const tccPageUrl = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/${basePageConfig.rewards}`;

  if (!hasPoints) return null;

  return (
    <Box
      sx={{
        width: '100%',
        position: isRelativePosition ? 'relative' : 'static',
        height: chipHeight,
      }}
    >
      <Chip
        variant="plain"
        color="neutral"
        sx={{
          background: (theme) => theme.palette.brand.warmLinen[500],
          width: '100%',
          maxWidth: '100%',
          px: 3,
          py: 0.5,
          ...((desktop || tablet) &&
            miniCartMode && {
              width: 496,
              maxWidth: 496,
              left: (theme) => theme.spacing(-6),
            }),
          ...(mobile
            ? {
                width: '100vw',
                maxWidth: '100vw',
                position: 'absolute',
                left: -16,
                top: 0,
                px: 6,
                py: 0.5,
              }
            : {}),
          [`& .${chipClasses.label}`]: {
            justifyContent: 'flex-start',
          },
        }}
      >
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography level={accessInPos ? 'caption1' : 'body1'}>You have</Typography>
          <Link level="caption1" sx={{ mx: 1 }} component={Link} href={tccPageUrl} underline="none">
            {currentData?.points_balance} credits!
          </Link>
          <Typography level={accessInPos ? 'caption1' : 'body1'}>Redeem your vouchers here.</Typography>
          <ArrowForwardIos sx={{ width: 16, height: 16, ml: 2 }} />
        </Typography>
      </Chip>
    </Box>
  );
};

// Backward-compatible alias for gradual migration.
export const CreditBanner = InlineCreditBanner;

export default InlineCreditBanner;
