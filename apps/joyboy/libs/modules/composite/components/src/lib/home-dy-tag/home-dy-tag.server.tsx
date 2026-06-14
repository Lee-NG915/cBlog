import { Fragment } from 'react';
import { DYResourceTag } from '@castlery/modules-dy-components';
import { DYPageTypes } from '@castlery/modules-dy-domain';
import { HomeDyTagClient } from './home-dy-tag.client';

export const HomeDyTagServer = () => {
  const recommendationContext = {
    type: DYPageTypes.HOME,
    data: [],
  };

  return (
    <Fragment>
      <DYResourceTag recommendationContext={recommendationContext} />
      <HomeDyTagClient />
    </Fragment>
  );
};
