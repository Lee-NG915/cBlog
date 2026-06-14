import React from 'react';
// eslint-disable-next-line
import { SbPage } from '@castlery/modules-cms-components';

const VisualBodySectionBanner = ({ sections }: { sections: any[] }) => {
  return (
    <>
      <SbPage blok={{ body: sections }} useInPLP={true} position="body_section" />
    </>
  );
};

export { VisualBodySectionBanner };
