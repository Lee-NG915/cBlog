import React from 'react';
import { asyncLoad } from 'components/AsyncLoad/utils';
import loadable from '@loadable/component';
import { loadIfNeeded } from 'redux/modules/interiorStylingService';

// interior-styling-service

const InteriorStylingService = loadable(() =>
  import(/* webpackChunkName: "InteriorStylingService" */ './InteriorStylingService')
);

const Index = ({ location }) => <InteriorStylingService location={location} />;

export default asyncLoad([
  async ({ store: { dispatch } }) => {
    await dispatch(loadIfNeeded());
  },
])(Index);
