'use client';
import { SbPage } from '@castlery/modules-cms-components';
import { Breadcrumb } from './breadcrumb';

interface StoryblokPageContentType {
  content: any;
  breadcrumb: string;
}

export const StoryblokPageContent = ({ content, breadcrumb }: StoryblokPageContentType) => {
  return (
    <>
      {breadcrumb && <Breadcrumb name={breadcrumb} />}
      <SbPage blok={content} maxWidth={1728} />
    </>
  );
};
