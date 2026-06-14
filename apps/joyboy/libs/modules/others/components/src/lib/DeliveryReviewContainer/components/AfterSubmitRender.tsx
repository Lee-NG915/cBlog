'use client';

import { Link, Stack, Textarea, Typography } from '@castlery/fortress';
import { CheckCircle, Duplicate } from '@castlery/fortress/Icons';
import { Button } from '@castlery/fortress';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useBreakpoints } from '@castlery/fortress';
import { useMemo, useState, useEffect } from 'react';
import { EcEnv } from '@castlery/config';
import { useAppDispatch } from '@castlery/shared-redux-store';
import {
  EVENT_GENERAL_LINK_CLICK,
  trackGeneralLinkClickEvent,
  trackGeneralLinkRedirectEvent,
} from '@castlery/modules-tracking-services';

const AfterSubmitRender = ({ rating, textValue }: { rating: number; textValue: string }) => {
  const { desktop } = useBreakpoints();
  const router = useRouter();
  const params = useParams();
  const region = params.region as string;
  const dispatch = useAppDispatch();
  const [countdown, setCountdown] = useState(5);

  const thirdConfig = useMemo(() => {
    if (EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
      return {
        text: 'Help new customers make confident decisions when shopping with us by sharing your review on Google  ',
        link: 'https://maps.app.goo.gl/Gt6DbJSWMR8x6KjP8',
        website: 'Google',
      };
    }
    return {
      text: 'Help new customers make confident decisions when shopping with us by sharing your review on Trustpilot  ',
      link: 'https://www.trustpilot.com/evaluate/www.castlery.com',
      website: 'Trustpilot',
    };
  }, [EcEnv]);

  // 倒计时逻辑
  useEffect(() => {
    if (rating === 5 && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (rating === 5 && countdown === 0) {
      // 倒计时结束，跳转到链接
      dispatch(trackGeneralLinkRedirectEvent({ label: thirdConfig.website, link: thirdConfig.link }));
      window.location.href = thirdConfig.link;
    }
  }, [rating, countdown, dispatch, thirdConfig]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(EVENT_GENERAL_LINK_CLICK({ label: thirdConfig.website, link: thirdConfig.link }));
    setTimeout(() => {
      window.location.href = thirdConfig.link;
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(textValue);
  };

  const handleButtonClick = () => {
    router.push(`/${region}`);
  };

  const FourStarRender = () => {
    return (
      <>
        <Typography
          level="body1"
          sx={(theme) => ({
            maxWidth: '600px',
            textAlign: 'center',
            mb: {
              xs: theme.spacing(5),
              md: theme.spacing(10),
            },
          })}
        >
          {thirdConfig.text}
          <Link href={thirdConfig.link} onClick={handleLinkClick}>
            here
          </Link>
        </Typography>
        {textValue !== '' && (
          <Stack
            sx={(theme) => ({
              position: 'relative',
              mb: theme.spacing(10),
              ...(!desktop && {
                width: '100%',
              }),
            })}
          >
            <Textarea
              value={textValue}
              readOnly
              sx={(theme) => ({
                fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                '&::placeholder': {
                  color: theme.palette.brand.maroonVelvet[200],
                },
                padding: '8px !important',
                fontSize: '18px',
                lineHeight: '1.5',
                color: theme.palette.brand.maroonVelvet[500],
                minHeight: '200px',
                minWidth: desktop ? '500px' : '100%',
                overflowY: 'scroll',
                resize: 'none',
                border: `1px solid ${theme.palette.brand.mono[300]}`,
              })}
            />
            <Stack sx={{ position: 'absolute', right: '4px', bottom: '4px', cursor: 'pointer' }}>
              <Duplicate onClick={handleCopy} />
            </Stack>
          </Stack>
        )}
      </>
    );
  };

  const FiveStarRender = () => {
    return (
      <Typography level="body1" sx={(theme) => ({ maxWidth: '600px', textAlign: 'center', mb: theme.spacing(10) })}>
        We're thrilled to hear you had a great experience.
        <br />
        Please take a moment to leave us a review on {thirdConfig.website}.
        <br />
        <br />
        You will be redirected in {countdown} seconds...
      </Typography>
    );
  };

  if (!desktop) {
    return (
      <Stack
        sx={(theme) => ({
          alignItems: 'center',
          padding: `0 ${theme.spacing(6)} ${theme.spacing(10)} ${theme.spacing(6)}`,
        })}
      >
        <CheckCircle
          sx={(theme) => ({
            width: theme.spacing(20),
            height: theme.spacing(20),
            mb: theme.spacing(6),
            fill: theme.palette.brand.leafGreen[500],
          })}
        />
        <Typography
          level="body1"
          sx={(theme) => ({
            mb: {
              xs: theme.spacing(5),
              md: theme.spacing(10),
            },
            textAlign: 'center',
          })}
        >
          {rating === 5 ? 'Thank you for your feedback!' : 'Thank you for sharing your experience!'}
        </Typography>
        {rating === 4 && <FourStarRender />}
        {rating === 5 && <FiveStarRender />}
        <Button sx={{ width: '100%' }} onClick={handleButtonClick}>
          CONTINUE SHOPPING
        </Button>
      </Stack>
    );
  }
  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        padding: `0 ${theme.spacing(15)} ${theme.spacing(30)} ${theme.spacing(15)}`,
        alignItems: 'center',
      })}
    >
      <CheckCircle
        sx={(theme) => ({
          width: theme.spacing(20),
          height: theme.spacing(20),
          mb: theme.spacing(6),
          fill: theme.palette.brand.leafGreen[500],
        })}
      />
      <Typography level="body1" sx={(theme) => ({ mb: theme.spacing(4), textAlign: 'center' })}>
        {rating === 5 ? 'Thank you for your feedback!' : 'Thank you for sharing your experience!'}
      </Typography>
      {rating === 4 && <FourStarRender />}
      {rating === 5 && <FiveStarRender />}
      <Button onClick={handleButtonClick}>CONTINUE SHOPPING</Button>
    </Stack>
  );
};

export { AfterSubmitRender };
