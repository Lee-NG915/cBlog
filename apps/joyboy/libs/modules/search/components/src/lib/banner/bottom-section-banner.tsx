import React from 'react';
import { Stack } from '@castlery/fortress';
import {
  FullWidthBanner,
  LinkBannerV2,
  RecommendationCarousel,
  SocialUGC,
  HalfBanner,
  Accordion,
} from '@castlery/modules-cms-components';

const BottomSectionBanner = ({ sections }: { sections: any }) => {
  // return <Stack>test</Stack>;
  return (
    <Stack>
      {sections.map((section) => (
        <section key={section._uid}>
          {section.component === 'full-width-banner' && <FullWidthBanner blok={section} />}
          {section.component === 'Recommendation Carousel' && <RecommendationCarousel blok={section} />}
          {section.component === 'Link Banner' && <LinkBannerV2 blok={section} />}
          {section.component === 'Half Banner' && <HalfBanner blok={section} />}
          {section.component === 'Social UGC' && <SocialUGC blok={section} />}
          {section.component === 'Accordion' && <Accordion blok={section} />}
        </section>
      ))}
    </Stack>
  );
};

export { BottomSectionBanner };
