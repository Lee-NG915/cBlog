import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import ReactPicture from 'components/ReactPicture';
import { cloudinaryRoot, globalFeatureInAU } from 'config';
import Banner from 'components/Banner';
import VariantList from 'components/VariantList';
import { connect } from 'react-redux';
import { loadIfNeeded as loadList } from 'redux/modules/variantList';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
@connect(
  (state) => ({
    list: state.variantList,
  }),
  { loadList }
)
export default class Feat extends React.Component {
  static propTypes = {
    list: PropTypes.object,
    loadList: PropTypes.func,
  };

  componentDidMount() {
    this.props.loadList(['yonoh', 'phil-procter', 'paolo-cappello', 'krystian-kowalski', 'charles', 'daniel-emma']);
  }

  render() {
    const { list } = this.props;

    const yonohList = list.yonoh && list.yonoh.data;
    const philProcterList = list['phil-procter'] && list['phil-procter'].data;
    const paoloCappelloList = list['paolo-cappello'] && list['paolo-cappello'].data;
    const krystianKowalskiList = list['krystian-kowalski'] && list['krystian-kowalski'].data;
    const charlesList = list.charles && list.charles.data;
    const emmaList = list['daniel-emma'] && list['daniel-emma'].data;

    return (
      <div className={style.feat}>
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1501055882/static/feat/title_bg_mobile.jpg',
              loader: { ratio: 0.603125 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1501055882/static/feat/title_bg.jpg',
              loader: { ratio: 0.228472 },
            },
          ]}
          lazy={false}
          title="Castlery Feat."
        />

        <div className={style.description}>
          <h1>Castlery feat.</h1>
          <p>
            is our exclusive collaboration with award-winning furniture designers from around the world. Here’s a series
            of extraordinary, never-before-seen collections – exclusively available at Castlery.
          </p>
        </div>

        {/* Yonoh */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1501055882/static/feat/yonoh_bg_mobile.jpg',
              loader: { ratio: 1.1671875 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1501056310/static/feat/yonoh_bg.jpg',
              loader: { ratio: 1 },
            },
          ]}
          lazy={false}
          title="Yonoh bg"
        >
          <div className={`${style.name} ${style.name}--yonoh`}>
            <h2>Yonoh</h2>
            <p>Spain // Red Dot Design Award Winner</p>
          </div>

          <div className={`${style.intro} ${style.intro}--yonoh`}>
            An award-winning design duo from Spain, Yonoh’s designs are versatile, innovative and exude timeless
            simplicity. Creating contemporary forms by drawing inspiration from past masters is their unique signature
            style and it is evident in all their work.
          </div>
        </Banner>

        <div className={`${style.block} ${style.block}--yonoh`}>
          <Container fixed>
            <ReactPicture
              className={`${style.block}__image`}
              srcset={`${cloudinaryRoot}/v1500885256/static/feat/Yonoh.jpg`}
              loader={{ ratio: 0.55 }}
              alt="Yonoh"
            />
            {yonohList && (
              <VariantList
                className={`${style.block}__variants`}
                variants={yonohList.variants}
                listName="Others - Yonoh List"
              />
            )}
          </Container>
        </div>

        {/* krystian */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1501059579/static/feat/krystian_kowalski_mobile_bg.jpg',
              loader: { ratio: 0.9296875 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1501041578/static/feat/krystian_kowalski_bg.jpg',
              loader: { ratio: 0.667361 },
            },
          ]}
          title="Krystian Kowalski bg"
        >
          <div className={`${style.name} ${style.name}--krystian`}>
            <h2>Krystian Kowalski</h2>
            <p>Poland // FX International Interior Design Award Winner</p>
          </div>

          <div className={`${style.intro} ${style.intro}--krystian`}>
            Based in Warsaw, Krystian Kowalski is a world-renowned designer whose furniture designs seek to integrate
            intelligent, human-centred solutions to our living needs.
          </div>
        </Banner>

        <div className={`${style.block} ${style.block}--krystian`}>
          <Container fixed>
            <ReactPicture
              className={`${style.block}__image`}
              srcset={`${cloudinaryRoot}/v1500885256/static/feat/Krystian_Kowalski.jpg`}
              loader={{ ratio: 0.55 }}
              alt="Krystian Kowalski"
            />

            {krystianKowalskiList && (
              <VariantList
                className={`${style.block}__variants`}
                variants={krystianKowalskiList.variants}
                listName="Others - Krystian Kowalski List"
              />
            )}
          </Container>
        </div>

        {/* paolo */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1501041578/static/feat/paolo_cappello_mobile_bg.jpg',
              loader: { ratio: 1.0484375 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1501041578/static/feat/paolo_cappello_bg.jpg',
              loader: { ratio: 0.621527 },
            },
          ]}
          title="Paolo Cappello bg"
        >
          <div className={`${style.name} ${style.name}--paolo`}>
            <h2>Paolo Cappello</h2>
            <p>Italy // EDIDA Elle Décor Young Designer Talent Italy</p>
          </div>

          <div className={`${style.intro} ${style.intro}--paolo`}>
            Paolo Cappello is a celebrated contemporary Italian designer who believes beauty is in the subtle details
            and strives to uncover its essence in a product.
          </div>
        </Banner>

        <div className={`${style.block} ${style.block}--paolo`}>
          <Container fixed>
            <ReactPicture
              className={`${style.block}__image`}
              srcset={`${cloudinaryRoot}/v1500885256/static/feat/Paolo_Cappello.jpg`}
              loader={{ ratio: 0.55 }}
              alt="Paolo Cappello"
            />

            {paoloCappelloList && (
              <VariantList
                className={`${style.block}__variants`}
                variants={paoloCappelloList.variants}
                listName="Others - Paolo Cappello List"
              />
            )}
          </Container>
        </div>

        {/* charles */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1543811475/static/feat/charles_mobile_bg.jpg',
              loader: { ratio: 1.06 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1543574408/static/feat/charles_bg.jpg',
              loader: { ratio: 0.75 },
            },
          ]}
          title="charles bg"
        >
          <div className={`${style.name} ${style.name}--charles`}>
            <h2>Charles Wilson</h2>
            <p>Australia // Designer of the Year, Home Beautiful Awards</p>
          </div>

          <div className={`${style.intro} ${style.intro}--charles`}>
            Charles Wilson is one of Australia’s foremost furniture and product designers whose sophisticated designs
            are especially suited for modern, urban living.
          </div>
        </Banner>

        <div className={`${style.block} ${style.block}--charles`}>
          <Container fixed>
            <ReactPicture
              className={`${style.block}__image`}
              srcset={`${cloudinaryRoot}/v1543573798/static/feat/charles.jpg`}
              loader={{ ratio: 0.55 }}
              alt="Charles"
            />
            {charlesList && (
              <VariantList
                className={`${style.block}__variants`}
                variants={charlesList.variants}
                listName="Others - Charles List"
              />
            )}
          </Container>
        </div>

        {/* emma */}
        <Banner
          className={style.banner}
          mediaQueries={[
            {
              breakpoint: 'xs',
              srcset: '/v1544512085/static/feat/emma_mobile_bg.jpg',
              loader: { ratio: 1.15 },
            },
            {
              breakpoint: 'lg',
              srcset: '/v1544510436/static/feat/emma_bg.jpg',
              loader: { ratio: 0.6652 },
            },
          ]}
          title="daniel emma bg"
        >
          <div className={`${style.name} ${style.name}--emma`}>
            <h2>Daniel Emma</h2>
            <p>Adelaide</p>
          </div>

          <div className={`${style.intro} ${style.intro}--emma`}>
            Daniel Emma are a design duo that creates the unexpected from simple objects using simple forms, drawing
            influence and insight from the diverse culture that Australia presents them with.
          </div>
        </Banner>
        <div className={`${style.block} ${style.block}--emma`}>
          <Container fixed>
            <ReactPicture
              className={`${style.block}__image`}
              srcset={`${cloudinaryRoot}/v1544510664/static/feat/emma.jpg`}
              loader={{ ratio: 0.55 }}
              alt="Daniel Emma"
            />
            {emmaList && (
              <VariantList
                className={`${style.block}__variants`}
                variants={emmaList.variants}
                listName="Others - Daniel Emma List"
              />
            )}
          </Container>
        </div>

        {/* phil */}
        {globalFeatureInAU && (
          <>
            <Banner
              className={style.banner}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: '/v1501059579/static/feat/phil_procter_mobile_bg.jpg',
                  loader: { ratio: 1.089 },
                },
                {
                  breakpoint: 'lg',
                  srcset: '/v1501041576/static/feat/phil_procter_bg.jpg',
                  loader: { ratio: 0.577 },
                },
              ]}
              title="Phil Procter bg"
            >
              <div className={`${style.name} ${style.name}--phil`}>
                <h2>Phil Procter</h2>
                <p>The Netherlands // Winner of Creative Industry Fund NL Internationalization Grant</p>
              </div>

              <div className={`${style.intro} ${style.intro}--phil`}>
                Born in Britain and based in The Netherlands, Phil Procter is an industrial designer who thoughtfully
                designs everyday objects that bring joy in appearance and utility.
              </div>
            </Banner>
            <div className={`${style.block} ${style.block}--phil`}>
              <Container fixed>
                <ReactPicture
                  className={`${style.block}__image`}
                  srcset={`${cloudinaryRoot}/v1500885256/static/feat/Phil_Procter.jpg`}
                  loader={{ ratio: 0.55 }}
                  alt="Phil Procter"
                />
                {philProcterList && (
                  <VariantList
                    className={`${style.block}__variants`}
                    variants={philProcterList.variants}
                    listName="Others - Phil Procter List"
                  />
                )}
              </Container>
            </div>
          </>
        )}
      </div>
    );
  }
}
