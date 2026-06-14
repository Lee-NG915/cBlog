import React from 'react';
// import { Link } from 'react-router';
import LazyLoad from 'react-lazyload';

import Banner from 'components/Banner';
import { VariantCollectionSideImage } from 'components/VariantCollection';
import { wrapPage } from 'utils/page';
// import { renderImage } from 'utils/image';

import { Container } from '@castlery/fortress';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const PAIR_UPS = [
  ['sofa-pairup', 'sofa-pairup-2'],
  ['table-pairup', 'table-pairup-2'],
  ['bed-pairup', 'bed-pairup-2'],
];

const NewYear = () => {
  const { desktop } = useBreakpoints();
  const mobile = !desktop;
  const PAIR_UP_TITLES = {
    'sofa-pairup': {
      SG: `Buy Sofa, get 20% off${mobile ? '<br />' : ''} Coffee Table or TV Console`,
      AU: `Buy Sofa, get 20% off${mobile ? '<br />' : ''} Coffee Table or TV Console`,
      US: `Buy Sofa, get 20% off${mobile ? '<br />' : ''} Coffee Table or TV Stand`,
    },
    'table-pairup': {
      SG: `Buy Dining Table, get 20% off${mobile ? '<br />' : ''} Dining Chair or Bench`,
      AU: `Buy Dining Table, get 20% off${mobile ? '<br />' : ''} Dining Chair or Bench`,
      US: `Buy Dining Table, get 20% off${mobile ? '<br />' : ''} Dining Chair or Bench`,
    },
    'bed-pairup': {
      SG: `Buy Bed Frame, get 20% off${mobile ? '<br />' : ''} Bedside Table or Dresser`,
      AU: `Buy Bed Frame, get 20% off${mobile ? '<br />' : ''} Bedside Table or Dresser`,
      US: `Buy Bed Frame, get 20% off${mobile ? '<br />' : ''} Nightstand or Dresser`,
    },
  };

  return (
    <div className={style.newYear}>
      <div className={`${style.newYear}__wrapper`}>
        <Container>
          <Banner
            className={`${style.newYear}__banner`}
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/static/new-year/2019/new-year-banner-mobile.jpg',
                loader: { ratio: '0.533333333' },
              },
              {
                breakpoint: 'lg',
                srcset: '/static/new-year/2019/new-year-banner-desktop.jpg',
                loader: { ratio: '0.29375' },
              },
            ]}
            lazy={false}
            title="New Year Pair Up Sale"
          />

          <div className={`${style.newYear}__intro`}>
            <h2 className={`${style.newYear}__intro-title`}>Style afresh this New Year</h2>
            <div className={`${style.newYear}__intro-detail`}>
              They say how you live is how you’ll feel. <br />
              Start your year afresh with brand-new furniture at 20% off with our pair-up sale!
            </div>
          </div>

          <div className={`${style.newYear}__pairUps`}>
            {PAIR_UPS.map((pairUp, index) => (
              <div key={index} className={`${style.newYear}__pairUp`}>
                <h3
                  className={`${style.newYear}__pairUp-title`}
                  dangerouslySetInnerHTML={{
                    __html: PAIR_UP_TITLES[pairUp[0]][__COUNTRY__],
                  }}
                />
                <LazyLoad offset={800} once height={600}>
                  {pairUp.map((pair) => (
                    <VariantCollectionSideImage
                      key={pair}
                      name={pair}
                      listName={`New Year Pair Up - ${pair}`}
                      imgPath="static/new-year/2019"
                    />
                  ))}
                </LazyLoad>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default wrapPage()(NewYear);
