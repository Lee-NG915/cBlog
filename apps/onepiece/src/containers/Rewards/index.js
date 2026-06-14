import { wrapPage } from 'utils/page';
import { load as loadDYResult } from 'redux/modules/dyApiData';
import { loadIfNeeded as loadStoryblokPage } from 'redux/modules/storyblokPage';
import { asyncLoad } from 'components/AsyncLoad/utils';
import Rewards from './component';

export default asyncLoad([
  ({ store: { dispatch }, pageType }) => dispatch(loadDYResult({ selectorArray: ['TCC Mechanics Test'], pageType })),
  ({ store: { dispatch } }) =>
    dispatch(
      loadStoryblokPage(
        `${__COUNTRY__.toLocaleLowerCase()}/general-content/tcc-pages/the-castlery-club${
          __APPLICATION_ENV__.includes('test') ? '-test' : ''
        }`
      )
    ),
])(wrapPage()(Rewards));
