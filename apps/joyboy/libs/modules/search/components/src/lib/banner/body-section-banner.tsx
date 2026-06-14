import React from 'react';
import { Stack } from '@castlery/fortress';
import { FullWidthBanner, NewTieredSaleBanner, LinkBannerV2 } from '@castlery/modules-cms-components';

const BodySectionBanner = ({ sections }: { sections: any }) => {
  return (
    <Stack>
      {sections.map((section) => (
        <section key={section._uid}>
          {section.component === 'full-width-banner' && <FullWidthBanner blok={section} />}
          {section.component === 'New Tiered Sale Banner' && <NewTieredSaleBanner blok={section} />}
          {section.component === 'Link Banner' && <LinkBannerV2 blok={section} />}
        </section>
      ))}
    </Stack>
  );
};

export { BodySectionBanner };
