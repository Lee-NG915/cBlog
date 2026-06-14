'use client';

import React from 'react';
import { GeneralBreadcrumbs } from '@castlery/shared-components';

interface BreadcrumbType {
  name: string;
}

export const Breadcrumb = ({ name }: BreadcrumbType) => {
  return (
    <GeneralBreadcrumbs
      breadcrumbs={[
        {
          label: name,
          link: `/${name}`,
        },
      ]}
    />
  );
};
