import React from 'react';
import { wrapPage } from 'utils/page';
import { load as loadRecommendations } from 'redux/modules/dyApiData';
import { asyncLoad } from 'components/AsyncLoad/utils';
import MainVideo from './components/Video';
import Intro from './components/Intro';
import Studio from './components/Studio';

const S2Campaign = () => (
  <>
    <MainVideo />

    <Intro />

    <Studio />
  </>
);

export default asyncLoad([
  ({ store: { dispatch } }) =>
    dispatch(
      loadRecommendations({
        selectorArray: ['Mindfulness Rec 1', 'Mindfulness Rec 2', 'Mindfulness Rec 3'],
      })
    ),
])(wrapPage({ hideBreadcrumbs: true })(S2Campaign));
