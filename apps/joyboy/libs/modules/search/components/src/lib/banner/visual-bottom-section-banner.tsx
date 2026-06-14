import React from 'react';
// eslint-disable-next-line
import { SbPage } from '@castlery/modules-cms-components';
import { JsonLd, WithContext, FAQPage } from '@castlery/seo';

const VisualBottomSectionBanner = ({ sections }: { sections: any[] }) => {
  return (
    <>
      {sections.map((section) => {
        if (section.component === 'Accordion' && section.has_faq_schema === true) {
          const jsonLd: WithContext<FAQPage> = {
            '@type': 'FAQPage',
            '@context': 'https://schema.org',
            mainEntity:
              section.items?.map((faq: any) => ({
                '@type': 'Question',
                name: faq.header,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.seo_description,
                },
              })) || [],
          };
          return <JsonLd code={jsonLd} />;
        }
      })}
      <SbPage blok={{ body: sections }} useInPLP={true} position="bottom_section" />
    </>
  );
};

export { VisualBottomSectionBanner };
