import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { loadIfNeeded as loadStores } from 'redux/modules/stores';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { wrapPage } from 'utils/page';
import PropTypes from 'prop-types';
import ShopTheLookSection from 'components/ShopTheLookSection';
import { useSelector, useDispatch } from 'react-redux';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { globalFeatureInSG } from 'config';
import TeaserVideo from './components/TeaserVideo';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import Studio from './components/Studio';
import { quizConfig } from './config';
import style from './style.scss';

const S1Campaign = (props, { router }) => {
  const { query } = router.location || {};
  const showQuizResult = quizConfig[query?.key];
  const quizRef = useRef(null);
  const shopTheLookData = useSelector(
    (state) =>
      state.marketing?.[`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/s1-shop-the-look`]
  );
  const s1Data = useMemo(() => shopTheLookData?.data?.story?.content?.s1, [shopTheLookData]);
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const scrollToQuiz = useCallback(() => {
    if (quizRef?.current) {
      quizRef.current.scrollIntoView();
    }
  }, [quizRef]);

  useEffect(() => {
    if (showQuizResult) {
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'manual';
      }
      scrollToQuiz();
    }
  }, [showQuizResult, scrollToQuiz]);

  useEffect(
    () => () => {
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'auto';
      }
    },
    [dispatch]
  );

  return (
    <>
      <TeaserVideo />

      <ShopTheLookSection
        shopTheLookData={s1Data}
        type="getaway"
        textConfig={{
          title: 'Create Your Own Sanctuary',
          description: 'Explore thoughtfully curated furniture that set the scene for mindfulness.',
          path: '/new',
        }}
      />

      <div
        className={`${style.s1Campaign}__recommend ${desktop ? 'container' : ''}`}
        data-campaign="S1 Recommendation #1"
      />

      <div className={`${style.s1Campaign}__divider`} />

      <div ref={quizRef}>{showQuizResult ? <QuizResults quizKey={query?.key} /> : <Quiz />}</div>

      {globalFeatureInSG && <Studio showInfo />}
    </>
  );
};

S1Campaign.contextTypes = {
  router: PropTypes.object,
};

export default asyncLoad([
  ({ store: { dispatch } }) => dispatch(loadStores()),
  ({ store: { dispatch } }) =>
    dispatch(
      loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/inspiration-tool-pages/s1-shop-the-look`)
    ),
])(wrapPage({ hideBreadcrumbs: true })(S1Campaign));
