import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage, withUseBreakpoints } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { Link } from 'react-router';
import { getLinkWithQuery } from 'utils/link';
import {
  cloudinaryRoot,
  enableCASpecialInSwatches,
  enableSpecialInSwatches,
  enableUKSpecialInSwatches,
  globalFeatureInUK,
  globalFeatureInUS,
} from 'config';
import { getUrl } from 'pages';
import { GhostArrowBtn } from 'components/Button';
import { addKnightPrefix } from 'pages/util.js';
import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class Swatches extends React.Component {
  static propTypes = {
    breakpoints: PropTypes.object,
  };

  render() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;

    console.log(getUrl(addKnightPrefix('chairs/armchairs')), 'chairs/armchairs');

    const IMAGE_LINKS = [
      {
        url: enableUKSpecialInSwatches
          ? getUrl(addKnightPrefix('sofas'))
          : getLinkWithQuery(addKnightPrefix('sofas'), {
              'material_filter[0]': 'Fabric',
              'material_filter[1]': 'Leather',
            }),
        src: enableSpecialInSwatches
          ? !desktop
            ? `${cloudinaryRoot}/v1743071902/fcr467i3t08kzevonipz.jpg`
            : `${cloudinaryRoot}/v1743071798/kjsyyr9jq3jasti4jgh2.jpg`
          : !desktop
          ? `${cloudinaryRoot}/v1638235652/category_banner/Sofa_Lounges_Mobile.jpg`
          : `${cloudinaryRoot}/v1638235651/category_banner/Sofa_Lounges_Desktop.jpg`,
        title: enableUKSpecialInSwatches ? 'Sofas' : 'Sofa / Lounges',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
      {
        url: enableCASpecialInSwatches
          ? getLinkWithQuery(addKnightPrefix('chairs/armchairs-accent-chairs'), {
              'material_filter[0]': 'Fabric',
            })
          : enableUKSpecialInSwatches
          ? getUrl(addKnightPrefix('chairs/armchairs'))
          : getLinkWithQuery(addKnightPrefix('chairs/dining-chairs'), {
              'material_filter[0]': 'Fabric',
            }),
        src: enableSpecialInSwatches
          ? !desktop
            ? `${cloudinaryRoot}/v1743072238/nfjitbafqytmykcwraew.jpg`
            : `${cloudinaryRoot}/v1743072207/vczturozfee40qbaaly8.jpg`
          : !desktop
          ? `${cloudinaryRoot}/v1638235652/category_banner/DiningChairs_Mobile.jpg`
          : `${cloudinaryRoot}/v1638235651/category_banner/DiningChairs_Desktop.jpg`,
        title: enableCASpecialInSwatches
          ? 'Armchairs and Accent Chairs'
          : enableUKSpecialInSwatches
          ? 'Armchairs'
          : 'Dining Chairs',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
      {
        url: enableUKSpecialInSwatches
          ? 'chairs/benches'
          : getLinkWithQuery(addKnightPrefix('chairs/dining-benches'), {
              'material_filter[0]': 'Fabric',
            }),
        src: enableSpecialInSwatches
          ? !desktop
            ? `${cloudinaryRoot}/v1743072049/gqdnldjrkzbgzuezb6ip.jpg`
            : `${cloudinaryRoot}/v1743071973/xirtdysdbo7bfnwuq0ah.jpg`
          : !desktop
          ? `${cloudinaryRoot}/v1638235650/category_banner/DiningBenches_Mobile.jpg`
          : `${cloudinaryRoot}/v1638235652/category_banner/DiningBenches_Desktop.jpg`,
        title: 'Dining Benches',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
      {
        url: getUrl(addKnightPrefix('beds/bedframes')) || getUrl(addKnightPrefix('beds/beds')),
        src: enableSpecialInSwatches
          ? !desktop
            ? `${cloudinaryRoot}/v1743072145/b18txbr1nrfgblrtmjn6.jpg`
            : `${cloudinaryRoot}/v1743072108/inzuk86cqk5f8lrhle2p.jpg`
          : !desktop
          ? `${cloudinaryRoot}/v1638235650/category_banner/BedFrames_Mobile.jpg`
          : `${cloudinaryRoot}/v1638235651/category_banner/BedFrames_Desktop.jpg`,
        title: 'Bed Frames',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
    ];

    const bannerImageUrl =
      'https://res.cloudinary.com/castlery/image/upload/v1700207237/static/landing/Free-Swatches.jpg';

    return (
      <div className={style.swatches}>
        <div className={`${style.swatches}__wrapper`}>
          <Container>
            <Banner
              className={`${style.swatches}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: bannerImageUrl,
                  loader: {
                    ratio: 0.8133,
                  },
                },
                {
                  breakpoint: 'lg',
                  srcset: bannerImageUrl,
                  loader: {
                    ratio: 0.4167,
                  },
                },
              ]}
              lazy={false}
              title="Free Swatches"
            >
              <div className={`${style.swatches}__header`}>
                <h1 className={`${style.swatches}__title`}>Free Swatches</h1>
                <p className={`${style.swatches}__subtitle`}>See and feel, before you buy.</p>
              </div>
            </Banner>
            <div className={`${style.swatches}__intro`}>
              <h2 className={`${style.swatches}__intro-title`}>Free Swatches</h2>
              <div className={`${style.swatches}__intro-detail`}>
                Can't decide on a {globalFeatureInUS ? 'color' : 'colour'} or texture? Pick up to 3 free swatches to
                help you make the right choice.
              </div>
            </div>

            <div className={`${style.swatches}__steps`}>
              <h2 className={`${style.swatches}__steps-title`}>How To Order</h2>
              <ol className={`${style.swatches}__steps-list`}>
                <li className={`${style.swatches}__step`}>
                  Click on 'Get Free Swatch', outlined in red, under the material options featured on each of our
                  product pages. Choose up to 3 free swatches and add them to your cart.
                </li>
                <li className={`${style.swatches}__step`}>
                  {globalFeatureInUK
                    ? 'Enter your delivery address (no payment details are required). You will receive an email with a shipment tracking link after you have placed your swatch order.​'
                    : 'Enter your delivery address (no payment details are required).'}
                </li>
                <li className={`${style.swatches}__step`}>
                  {globalFeatureInUK
                    ? 'Receive the swatches, delivered to your doorstep!'
                    : 'Receive the swatches, delivered to your doorstep! We will dispatch the swatches in 3 business days.'}
                </li>
                <li className={`${style.swatches}__step`}>
                  If you have any additional questions, our customer service team is happy to help.
                </li>
              </ol>
              <Link className={`${style.swatches}__steps-shopping`} to={getUrl('all-products')}>
                <GhostArrowBtn text="Start Shopping" />
              </Link>
            </div>

            <div className={`${style.swatches}__links`}>
              {IMAGE_LINKS.map((link, index) => (
                <Link key={index} to={link.url} className={`${style.swatches}__link`}>
                  <ReactPicture alt={link.title} loader={link.loader} srcset={link.src} />
                  <h4 className={`${style.swatches}__link-title`}>{link.title}</h4>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      </div>
    );
  }
}
