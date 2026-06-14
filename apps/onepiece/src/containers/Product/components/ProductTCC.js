import React, { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Link, useBreakpoints, Typography } from '@castlery/fortress';
import { CircleStar, Arrow } from 'fortress/Icons';
import { FrameContext } from 'containers/Frame/FrameContext';
import { isProd, isUat } from 'config';
import { useApiCampaigns } from 'hooks/dy';

const ProductTCC = () => {
  const isSignIn = useSelector((state) => state.auth.user);
  const showTCCBanner =
    useApiCampaigns({
      selectorArray: ['TCC PDP Banner'],
    })?.['TCC PDP Banner']?.data?.hasNewBanner === 'true';
  const frame = useContext(FrameContext);
  const { xl, mobile } = useBreakpoints();
  const renderBannerText = useMemo(() => {
    if (isSignIn) {
      return 'Unlock Your Rewards for Extra Savings!';
    }
    return 'Extra $50 off with The Castlery Club!';
  }, [isSignIn]);

  const renderLinkText = useMemo(() => {
    if (mobile) {
      if (!isSignIn) {
        return 'Sign up';
      }
    } else {
      if (!isSignIn) {
        return 'Sign up now';
      }
      return 'Check Rewards';
    }
  }, [isSignIn, mobile]);

  const handleCLickBanner = useCallback(() => {
    if (isSignIn) {
      window.open(
        `https://www${
          isProd ? '' : isUat ? '-uat' : '-test'
        }.castlery.com/${__COUNTRY__.toLocaleLowerCase()}/the-castlery-club`,
        '_blank'
      );
    } else {
      frame?.openModal('login', {
        fromPDPBanner: true,
      });
    }
  }, [isSignIn, frame]);
  if (showTCCBanner) {
    return (
      <Box
        sx={{
          marginTop: 2,
          boxSizing: 'border-box',
          height: '48px',
          background: '#F9F7F3',
          padding: xl ? '8px 12px' : '4px 4px',
          width: 'fit-content',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          cursor: 'pointer',
          borderRadius: '5px',
        }}
        onClick={handleCLickBanner}
      >
        <CircleStar
          sx={{
            marginRight: 1,
            minWidth: 24,
            minHeight: 24,
          }}
        />
        <Typography
          sx={{
            color: '#877445',
            fontSize: xl ? 14 : 12,
            marginRight: 2,
            textWrap: 'nowrap',
          }}
        >
          {renderBannerText}
        </Typography>
        <Link
          sx={{
            color: '#877445',
            fontSize: xl ? 14 : 12,
            textDecoration: 'underline',
            marginRight: 1,
            textWrap: 'nowrap',
          }}
        >
          {renderLinkText}
        </Link>
        <Arrow
          sx={{
            minWidth: 24,
            minHeight: 24,
          }}
        />
      </Box>
    );
  }

  return null;
};

export default ProductTCC;
