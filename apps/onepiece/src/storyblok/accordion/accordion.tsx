import React, { useRef, useState, useMemo } from 'react';
import { Container, Typography } from '@castlery/fortress';
import { AccordionRoot } from 'fortress';
import { storyblokEditable } from '@storyblok/react';
import { EVENT_ACCORDION_OPEN } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import Helmet from 'react-helmet';
import { useBreakpoints } from '@castlery/fortress/hooks';
import { useAnchorScroll } from '../hooks/anchor';
import { AccordionItem } from './accordion-item';

export type AccordionProps = {
  blok: {
    _uid?: string;
    items?: Array<{
      _uid?: string;
      header?: string;
      seo_description?: string;
    }>;
    anchor_link?: string;
    has_faq_schema?: boolean;
    presentation_header_text?: string;
    presentation_header_level?: string;
  };
};

function Accordion({ blok }: AccordionProps) {
  const {
    _uid,
    items = [],
    anchor_link,
    has_faq_schema,
    presentation_header_text,
    presentation_header_level,
  } = blok || {};
  const { mobile } = useBreakpoints();
  const hasHeader = presentation_header_text !== '';
  const [preVal, setPreVal] = useState<string[]>([]);
  const dispatch = useDispatch();

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  // const faqJsonLd = [];

  // if (has_faq_schema && items.length > 0 && Array.isArray(items)) {
  //   const faqContent = `{
  //     "@context": "http://schema.org",
  //     "@type": "FAQPage",
  //     "mainEntity": [
  //       ${items.map((item) => {
  //         return `
  //           {
  //             "@type": "Question",
  //             "name": ${JSON.stringify(item?.header)},
  //             "acceptedAnswer": {
  //               "@type": "Answer",
  //               "text": ${JSON.stringify(item?.seo_description)}
  //             }
  //           }
  //         `;
  //       })}
  //     ]
  //   }`;
  //   faqJsonLd.push(faqContent);
  // }

  const trackExpand = (header: string) => {
    dispatch({
      type: EVENT_ACCORDION_OPEN,
      result: {
        header,
      },
    });
  };

  const handleClick = (value: string[]) => {
    if (value.length > preVal.length) {
      const res = value[value.length - 1];
      trackExpand(res);
    }
    setPreVal(value);
  };

  const USPSection = useMemo(
    () => items?.map((nestedBlok) => <AccordionItem blok={nestedBlok} key={nestedBlok._uid} />),
    [items]
  );

  return (
    <>
      {has_faq_schema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: items.map((item) => ({
                '@type': 'Question',
                name: JSON.stringify(item?.header),
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: JSON.stringify(item?.seo_description),
                },
              })),
            })}
          </script>
        </Helmet>
      )}
      <Container {...storyblokEditable(blok)} key={_uid} id={anchor_link?.slice(1)} ref={blokRef}>
        <AccordionRoot
          variant="outlined"
          type="multiple"
          onValueChange={handleClick}
          sx={{
            maxWidth: '922px',
            margin: '0 auto',
          }}
          hasHeader={hasHeader}
        >
          {hasHeader && (
            <Typography
              level={presentation_header_level}
              sx={(theme) => ({
                // fontSize: mobile ? '1.5rem' : '1.75rem',
                // lineHeight: mobile ? '2.25rem' : '2.625rem',
                fontFamily: theme.fontFamily.display,
              })}
            >
              {presentation_header_text}
            </Typography>
          )}
          {USPSection}
        </AccordionRoot>
      </Container>
    </>
  );
}

export { Accordion };
