'use client';

import { Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@castlery/fortress';
import { hasRichText } from '../../utils/rich-text-utils';
import { RichTextTypography } from '../component-v1/components';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { ImageProps } from '../component-v1/image';
import { VideoProps } from '../component-v1/video/video';
import { EcEnv } from '@castlery/config';
import { EVENT_PDP_FAQ } from '@castlery/modules-tracking-services';

interface ProductFaqListClientProps {
  faqs: {
    _uid: string;
    header: string;
    header_color: string;
    description?: string;
    image?: ImageProps[];
    video?: VideoProps[];
    anchor_link?: string;
  }[];
}

const ProductFaqListClient = ({ faqs }: ProductFaqListClientProps) => {
  const { desktop, mobile } = useBreakpoints();
  const dispatch = useAppDispatch();
  const helpCenterUrl = `https://www.castlery.com/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/help-center`;
  const faqSectionRef = React.useRef<HTMLDivElement | null>(null);
  const faqImpressionTrackedRef = React.useRef(false);
  const faqImpressionTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const target = faqSectionRef.current;
    if (!target || faqImpressionTrackedRef.current) {
      return;
    }

    const clearImpressionTimer = () => {
      if (faqImpressionTimerRef.current) {
        clearTimeout(faqImpressionTimerRef.current);
        faqImpressionTimerRef.current = null;
      }
    };

    const startImpressionTimer = () => {
      if (faqImpressionTimerRef.current || faqImpressionTrackedRef.current) {
        return;
      }
      faqImpressionTimerRef.current = setTimeout(() => {
        dispatch(EVENT_PDP_FAQ({ category: 'pdp_faqs_impression', action: 'impression' }));
        faqImpressionTrackedRef.current = true;
        faqImpressionTimerRef.current = null;
      }, 3000);
    };

    if (!window.IntersectionObserver) {
      startImpressionTimer();
      return clearImpressionTimer;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          startImpressionTimer();
          return;
        }
        clearImpressionTimer();
      },
      { threshold: 0.3 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      clearImpressionTimer();
    };
  }, [dispatch]);

  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    dispatch(
      EVENT_PDP_FAQ({
        category: 'pdp_faqs_click',
        action: isExpanded ? 'expands' : 'collapses',
      })
    );
  };

  const handleHelpCenterClick = () => {
    dispatch(
      EVENT_PDP_FAQ({
        category: 'pdp_faqs_click',
        action: 'click',
        label: 'help_center',
        tag: 'destination_url',
        tagValue: helpCenterUrl,
      })
    );
  };

  const handleCasaButtonClick = () => {
    dispatch(
      EVENT_PDP_FAQ({
        category: 'pdp_faqs_click',
        action: 'click',
        label: window.__CASA_INSTANCE__?.openChat ? 'Casa' : 'Gladly',
      })
    );
    window.__CASA_INSTANCE__?.openChat ? window.__CASA_INSTANCE__.openChat() : window?.Gladly?.show?.();
  };

  return (
    <Stack
      ref={faqSectionRef}
      sx={(theme) => ({
        width: '100%',
        backgroundColor: theme.palette.brand.warmLinen[500],
        display: 'flex',
        flexDirection: 'column',
        padding: `${theme.spacing(8)} ${theme.spacing(6)}`,
        gap: theme.spacing(4),
        ...(mobile && {
          padding: `${theme.spacing(8)} ${theme.spacing(4)}`,
          flexDirection: 'column',
          gap: theme.spacing(4),
        }),
        ...(desktop && {
          padding: `${theme.spacing(15)}`,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: theme.spacing(8),
        }),
      })}
    >
      <Stack>
        <Typography
          level="h3"
          sx={(theme) => ({
            mb: theme.spacing(2),
          })}
        >
          Frequently Asked Questions
        </Typography>
        <Typography
          level="caption1"
          sx={(theme) => ({
            ...(!desktop &&
              !mobile && {
                fontSize: '14px !important',
              }),
          })}
        >
          Have more questions? Browse our{' '}
          <Link
            href={helpCenterUrl}
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
            onClick={handleHelpCenterClick}
            sx={(theme) => ({
              whiteSpace: 'nowrap',
              color: theme.palette.brand.burntOrange[500],
            })}
          >
            Help Center
          </Link>{' '}
          for detailed answers, or get instant answers from our{' '}
          <Link
            component="button"
            underline="always"
            onClick={handleCasaButtonClick}
            sx={(theme) => ({
              whiteSpace: 'nowrap',
              color: theme.palette.brand.burntOrange[500],
            })}
          >
            Chatbot
          </Link>
          .
        </Typography>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          ...(desktop && {
            minWidth: 738,
            maxWidth: 738,
          }),
        }}
      >
        {faqs.map((faq) => {
          const { _uid, header, header_color, description, image = [], video = [] } = faq || {};

          return (
            <Accordion
              key={_uid}
              onChange={handleAccordionChange}
              sx={{
                py: 3,
                px: 0,
                mb: 3,
              }}
            >
              {header && (
                <AccordionSummary>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      level="h5"
                      sx={(theme) => ({
                        color: header_color || theme.palette.brand.mono[900],
                      })}
                    >
                      {header}
                    </Typography>
                  </Box>
                </AccordionSummary>
              )}
              <AccordionDetails
                sx={{
                  '--AccordionDetails-transition':
                    'grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1), padding-block 280ms cubic-bezier(0.4, 0, 0.2, 1)',
                  '&[hidden]': {
                    display: 'grid !important',
                  },
                }}
              >
                {hasRichText(description) && (
                  <RichTextTypography
                    description={description}
                    sx={(theme) => ({
                      color: theme.palette.brand.mono[900],
                      pt: theme.spacing(4),
                      p: {
                        fontSize: desktop ? '14px !important' : '12px !important',
                      },
                      a: {
                        textDecorationColor: theme.palette.brand.burntOrange[500],
                        color: theme.palette.brand.burntOrange[500],
                      },
                    })}
                  />
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Stack>
  );
};

export { ProductFaqListClient };
