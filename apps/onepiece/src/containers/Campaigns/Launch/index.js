import React from 'react';
import PropTypes from 'prop-types';
import { withUseBreakpoints, wrapPage } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot } from 'config';
import { Link } from 'react-router';
import { getUrl } from 'pages';
import VariantList from 'components/VariantList';
import Variant from 'components/VariantList/Variant';
import { connect } from 'react-redux';
import { loadIfNeeded as loadList } from 'redux/modules/variantList';
import Spinner from 'components/Spinner';
import SellingPoint from 'components/SellingPoint';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
@connect(
  (state) => ({
    list: state.variantList,
  }),
  { loadList }
)
@withUseBreakpoints
export default class Launch extends React.Component {
  static propTypes = {
    list: PropTypes.object,
    loadList: PropTypes.func,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  LIST_NAME = 'launch-page-list';

  componentDidMount() {
    this.props.loadList(this.LIST_NAME);
  }

  render() {
    const {
      list,
      breakpoints: { desktop },
    } = this.props;

    return (
      <div>
        {/* top banner */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1500542018/static/launch/launch_mobile.jpg',
              loader: { ratio: 1.2 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1502074570/static/launch/launch-banner-desktop.jpg',
              loader: { ratio: 0.45 },
            },
          ]}
          lazy={false}
          title="celebrate our launch!"
        >
          <div className={style.bannerContent}>
            <h1>LAUNCH PROMO EXTENDED!</h1>
            <p>
              <strong>STOREWIDE 10% OFF + FREE ITEM</strong>
              <span> above $300 min. spend</span>
            </p>
            <p>
              USE CODE: <span>CHEERSMATE</span>
            </p>
          </div>
        </Banner>

        {/* benefits */}
        <Container maxWidth="md">
          <div className={style.benefits}>
            <div className={`${style.benefits}__intro`}>
              {!desktop && (
                <p>
                  Australia, we’re finally here! For a limited time only, use code <strong>CHEERSMATE</strong> to enjoy
                  10% off and a FREE ITEM with min. spend!
                </p>
              )}
              {!desktop && <p>Valid till 13 Aug and applicable storewide, including discounted items.</p>}
              {desktop && (
                <p>
                  Australia, we’re finally here! To celebrate this milestone, we are running a limited-time only special
                  promotion from now till 13 August 2017. Enjoy our launch special across our wide range of stylish
                  furniture for living room, dining room, bedroom, and home office. Simply use code{' '}
                  <strong>CHEERSMATE</strong> to receive 10% off and a FREE ITEM with minimum purchase. Applicable
                  storewide, including discounted items. We can’t wait to furnish your home!
                </p>
              )}
            </div>
            <div className={`${style.benefits}__points`}>
              <div className={`${style.benefits}__point`}>
                <div>
                  {!desktop && (
                    <p className={`${style.benefits}__point__title ${style.benefits}__point__title--mobile`}>
                      10% OFF + Free Throw Pillow
                    </p>
                  )}
                  <p className={`${style.benefits}__point__title`}>
                    10% OFF +<br />
                    Free Throw Pillow
                  </p>
                  <p className={`${style.benefits}__point__value`}>(worth $39)</p>
                </div>
                <div className={`${style.benefits}__point__image`}>
                  <ReactPicture
                    srcset={`${cloudinaryRoot}/v1502090186/static/launch/throw_pillow.jpg`}
                    alt="throw pillow"
                    loader={{ ratio: 0.667, widths: ['210'], sizes: '210px' }}
                  />
                </div>
                <p className={`${style.benefits}__point__condition`}>with $300 min. spend</p>
              </div>
              <div className={`${style.benefits}__point`}>
                <div>
                  {!desktop && (
                    <p className={`${style.benefits}__point__title ${style.benefits}__point__title--mobile`}>
                      10% OFF + Free Alroy Pouf
                    </p>
                  )}
                  <p className={`${style.benefits}__point__title`}>
                    10% OFF +<br />
                    Free Alroy Pouf
                  </p>
                  <p className={`${style.benefits}__point__value`}>(worth $69)</p>
                </div>
                <div className={`${style.benefits}__point__image`}>
                  <ReactPicture
                    srcset={`${cloudinaryRoot}/v1502090186/static/launch/alroy_pouf.jpg`}
                    alt="alroy pouf"
                    loader={{ ratio: 0.667, widths: ['210'], sizes: '210px' }}
                  />
                </div>
                <p className={`${style.benefits}__point__condition`}>with $1,000 min. spend</p>
              </div>
              <div className={`${style.benefits}__point`}>
                <div>
                  {!desktop && (
                    <p className={`${style.benefits}__point__title ${style.benefits}__point__title--mobile`}>
                      10% OFF + Free Calvin Floor Lamp
                    </p>
                  )}
                  <p className={`${style.benefits}__point__title`}>
                    10% OFF +<br />
                    Free Calvin Floor Lamp
                  </p>
                  <p className={`${style.benefits}__point__value`}>(worth $179)</p>
                </div>
                <div className={`${style.benefits}__point__image`}>
                  <ReactPicture
                    srcset={`${cloudinaryRoot}/v1501142061/static/launch/calvin_floor_lamp.jpg`}
                    alt="calvin floor lamp"
                    loader={{ ratio: 0.667, widths: ['210'], sizes: '210px' }}
                  />
                </div>
                <p className={`${style.benefits}__point__condition`}>with $2,500 min. spend</p>
              </div>
            </div>
          </div>
        </Container>

        {/* variant list */}
        <Container maxWidth="md">
          <div className={style.list}>
            <h3>{desktop && <span>HERE'S </span>}A GOOD PLACE TO START</h3>
            <p>
              Our launch promotion is applicable storewide, including discounted items. Maximise your savings with these
              newly-discounted items.
            </p>
            {list[this.LIST_NAME] &&
              (list[this.LIST_NAME].loading ? (
                <div className={`${style.list}__loading`}>
                  <Spinner />
                </div>
              ) : list[this.LIST_NAME].data ? (
                list[this.LIST_NAME].data.variants.length > 0 ? (
                  <div className={`${style.list}__products`}>
                    {!desktop ? (
                      <VariantList
                        variants={list[this.LIST_NAME].data.variants}
                        listName="Others - Launch Page Products"
                      />
                    ) : (
                      list[this.LIST_NAME].data.variants.map((variant, index) => (
                        <div key={variant.id}>
                          <Variant
                            listName="Others - Launch Page Products"
                            listPosition={index + 1}
                            variant={variant}
                          />
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className={`${style.studio}__products__empty`}>Oops, there's no products</div>
                )
              ) : (
                <div className={`${style.list}__error`}>
                  {Array.isArray(list[this.LIST_NAME].error.errors) && list[this.LIST_NAME].error.errors[0].detail}
                </div>
              ))}
            <Link to={getUrl('sale')} className="btn">
              Shop More
            </Link>
          </div>
        </Container>

        {/* second last banner */}
        <div>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/v1501147434/static/launch/banner1_mobile.jpg',
                loader: { ratio: 0.824 },
              },
              {
                breakpoint: 'lg',
                srcset: '/v1501145059/static/launch/banner1.jpg',
                loader: { ratio: 0.45138 },
              },
            ]}
            title="come and say hi!"
          >
            <div className={style.bannerContent2}>
              <h3>COME AND SAY HI!</h3>
              {!desktop ? (
                <p>Get up close and personal with your favourite items.</p>
              ) : (
                <p>
                  Get up close and personal with your favourite items. Chat with our friendly consultants who are here
                  to answer your queries, help you with fabric customisation and provide useful styling tips.
                </p>
              )}
              <button type="button" onClick={() => this.context.frame.openModal('appointment')} className="btn">
                BOOK APPOINTMENT
              </button>
            </div>
          </Banner>
        </div>

        {/* last banner */}
        <div className={style.lastBanner}>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset: '/v1501147434/static/launch/banner2_mobile.jpg',
                loader: { ratio: 0.824 },
              },
              {
                breakpoint: 'lg',
                srcset: '/v1501145059/static/launch/banner2.jpg',
                loader: { ratio: 0.45138 },
              },
            ]}
            title="not your typical furniture store"
          >
            <div className={`${style.bannerContent2} ${style.bannerContent2}--last`}>
              {!desktop ? <h3>NOT LIKE THE REST</h3> : <h3>NOT YOUR TYPICAL FURNITURE STORE</h3>}
              <p>At Castlery we believe furniture should be stylish and well-made, minus the inflated price tag.</p>
              <Link to={getUrl('our-story')} className="btn">
                LEARN MORE
              </Link>
            </div>
          </Banner>
        </div>

        {/* selling points */}
        <Container>
          <SellingPoint />
        </Container>
      </div>
    );
  }
}
