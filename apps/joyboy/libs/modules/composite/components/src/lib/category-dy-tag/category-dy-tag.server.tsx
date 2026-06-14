import { Fragment } from 'react';
import { DYResourceTag } from '@castlery/modules-dy-components';
import { DYPageTypes } from '@castlery/modules-dy-domain';
import { CategoryDyTagClient } from './category-dy-tag.client';

interface CategoryDyTagServerProps {
  breadcrumbNames: string[];
}

export const CategoryDyTagServer = ({ breadcrumbNames }: CategoryDyTagServerProps) => {
  if (!breadcrumbNames?.length) {
    return null;
  }

  const recommendationContext = {
    type: DYPageTypes.CATEGORY,
    data: breadcrumbNames,
  };

  return (
    <Fragment>
      <DYResourceTag recommendationContext={recommendationContext} />
      <CategoryDyTagClient breadcrumbNames={breadcrumbNames} />
    </Fragment>
  );
};
