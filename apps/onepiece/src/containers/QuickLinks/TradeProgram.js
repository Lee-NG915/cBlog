import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PageHeader from 'components/PageHeader';
import ReactPicture from 'components/ReactPicture';
import TicketForm from 'components/TicketForm';
import { wrapPage, withUseBreakpoints } from 'utils/page';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { cloudinaryRoot } from 'config';
import { loadIfNeeded as loadMarketing } from 'redux/modules/marketing';
import { getBreakpoint, getWidth } from 'utils/breakpoints';
import { Container } from '@castlery/fortress';
import { getUserDevice } from 'utils/device';
import lang from 'utils/lang';
import SocialSection from '../Home/components/SocialSection';
import style from './style.scss';

const device = getUserDevice();
const IMAGE_SIZES =
  device !== 'desktop'
    ? {
        mediaQuery:
          `(min-width: ${getBreakpoint('xxl', 'min')}px) ${0.5 * getWidth('xxl')}px, ` +
          `(min-width: ${getBreakpoint('xsl', 'min')}px) ${0.5 * getWidth('xsl')}px, ` +
          `(min-width: ${getBreakpoint('xl', 'min')}px) ${0.5 * getWidth('xl')}px, ` +
          `(min-width: ${getBreakpoint('lg', 'min')}px) ${0.5 * getWidth('lg')}px, ` +
          `(min-width: ${getBreakpoint('md', 'min')}px) ${getWidth('md')}px, ` +
          `100vw`,
        widths: [
          `320-${getWidth('md')}`,
          0.5 * getWidth('lg'),
          0.5 * getWidth('xl'),
          0.5 * getWidth('xsl'),
          0.5 * getWidth('xxl'),
        ],
      }
    : {
        mediaQuery:
          `(min-width: ${getBreakpoint('xxl', 'min')}px) ${0.25 * getWidth('xxl')}px, ` +
          `(min-width: ${getBreakpoint('xsl', 'min')}px) ${0.25 * getWidth('xsl')}px, ` +
          `(min-width: ${getBreakpoint('xl', 'min')}px) ${0.33 * getWidth('xl')}px, ` +
          `${0.5 * getWidth('lg')}px`,
        widths: [0.5 * getWidth('lg'), 0.33 * getWidth('xl'), 0.25 * getWidth('xsl'), 0.25 * getWidth('xxl')],
      };

const IMAGE_LOADER = {
  ratio: 0.545,
};

const selectBannerPic = (device) => {
  switch (__COUNTRY__) {
    case 'CA':
      switch (device) {
        case 'mobile':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739932040/trade%20program/ikjr6r1qw8u3t720pgpc.jpg';
        default:
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739931493/trade%20program/xqepvahy1toy4ea7fw1n.jpg';
      }
    case 'UK':
      switch (device) {
        case 'mobile':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739932040/trade%20program/ikjr6r1qw8u3t720pgpc.jpg';
        default:
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739931493/trade%20program/xqepvahy1toy4ea7fw1n.jpg';
      }
    default:
      switch (device) {
        case 'mobile':
          return '/v1638235650/category_banner/TopBanner_Mobile.jpg';
        default:
          return '/v1638235650/category_banner/TopBanner_Desktop.jpg';
      }
  }
};

const selectTitle = (rank) => {
  switch (rank) {
    case 0:
      switch (__COUNTRY__) {
        case 'SG':
          return 'Exclusive Trade Rebate';
        case 'CA':
          return 'Exclusive Discounts';
        case 'UK':
          return 'Exclusive Discounts';
        default:
          return 'Exclusive Trade Discounts';
      }
    case 1:
      switch (__COUNTRY__) {
        case 'CA':
          return 'Dedicated Support';
        case 'UK':
          return 'Dedicated Support';
        default:
          return 'Professional Advice';
      }
    default:
      switch (__COUNTRY__) {
        case 'SG':
          return 'Product Diversity';
        case 'CA':
          return 'Diverse Picks';
        case 'UK':
          return 'Diverse Picks';
        default:
          return 'Product Diversity';
      }
  }
};

const selectDescription = (rank) => {
  switch (rank) {
    case 0:
      switch (__COUNTRY__) {
        case 'SG':
          return 'It pays to be a member! Join us and receive exclusive storewide rebates*.';
        case 'CA':
          return 'Receive 10% off all orders over $1,000. T&Cs apply.';
        case 'UK':
          return 'Receive 10% off all orders over £1,000. T&Cs apply.';
        default:
          return 'Get access to discounts* of 10% off when you join our program.';
      }
    case 1:
      switch (__COUNTRY__) {
        case 'SG':
          return `We’ve got a dedicated team of experts, ready to serve and provide you with any guidance you require throughout your buying process. We're always here to address any enquiries you may have along the way. `;
        case 'UK':
          return `Get help with product information, quotes, placing orders and more. `;
        case 'CA':
          return 'Get help with product information, quotes, placing orders and more. ';
        default:
          return `Receive advice from our team of experts who will provide you with the guidance you need throughout your buying process.
          Our dedicated team is ready to speak to you and address any enquiries you have.`;
      }
    default:
      switch (__COUNTRY__) {
        case 'SG':
          return 'Choose from a range of stylish and modern furniture products, available in different colours and styles. There’s something for every need and preference, with over 3000+ quality designs in store.';
        case 'UK':
          return 'Discover our extensive product range and fabric options to fit your next project.';
        case 'CA':
          return 'Discover our extensive product range and fabric options to fit your next project.';
        default:
          return 'Choose from a range of stylish and modern furniture products in different colours and styles.';
      }
  }
};

const selectInfo = () => {
  switch (__COUNTRY__) {
    case 'SG':
      return '*For trade orders of $1,000 and above. T&Cs apply.';
    case 'UK':
      return '';
    case 'CA':
      return '';
    default:
      return `*Applies only to orders above $1000`;
  }
};

const selectImageSrcset = (rank) => {
  switch (rank) {
    case 0:
      switch (__COUNTRY__) {
        case 'CA':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739876309/trade%20program/hukinxcd7rxmxfk4sqt5.jpg';
        case 'UK':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739876309/trade%20program/hukinxcd7rxmxfk4sqt5.jpg';
        default:
          return `${cloudinaryRoot}/v1638235650/category_banner/Thumbnail_ExclusiveTradeDiscounts.jpg`;
      }
    case 1:
      switch (__COUNTRY__) {
        case 'CA':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739876518/trade%20program/u7s07fpdumkhsy1erfxs.jpg';
        case 'UK':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739876518/trade%20program/u7s07fpdumkhsy1erfxs.jpg';
        default:
          return `${cloudinaryRoot}/v1552963883/static/landing/professional-advice.png`;
      }
    default:
      switch (__COUNTRY__) {
        case 'CA':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739876555/trade%20program/jx2tfgqrdq0wgpr429n2.png';
        case 'UK':
          return 'https://res.cloudinary.com/dkmcmqbzl/image/upload/v1739876555/trade%20program/jx2tfgqrdq0wgpr429n2.png';
        default:
          return `${cloudinaryRoot}/v1638235650/category_banner/Thumbnail_ProductDiversity.jpg`;
      }
  }
};

const selectFormHeader = (device) => {
  switch (__COUNTRY__) {
    case 'SG':
      switch (device) {
        case 'desktop':
          return 'Ready to join our trade rebate programme? <br /> Fill up the form below and we’ll get back to you as soon as possible.';
        default:
          return `Ready to join our trade rebate programme? Fill up the form below and we’ll get back to you as soon as possible.`;
      }
    case 'CA':
      return `Ready to join Castlery's Trade Discount Furniture Program? <br /> Fill out the form below, and we’ll get back to you as soon as possible. <br /> For further enquiries, email us at <span style="text-decoration: underline;">trade.ca@castlery.com</span>. `;
    case 'UK':
      return `Ready to join Castlery's Trade Discount Furniture Program? <br /> Fill out the form below, and we’ll get back to you as soon as possible. <br /> For further enquiries, email us at <span style="text-decoration: underline;">trade.uk@castlery.com</span>. `;
    default:
      switch (device) {
        case 'desktop':
          return 'Ready to join our trade discount furniture program? <br /> Fill out the form below, and we’ll get back to you as soon as possible.';
        default:
          return `Ready to join our trade discount furniture program? Fill out the form below, and we’ll get back to you as soon as possible.`;
      }
  }
};

const SECTIONS = [
  {
    title: selectTitle(0),
    description: selectDescription(0),
    info: selectInfo(),
    image: {
      srcset: selectImageSrcset(0),
    },
  },
  {
    title: selectTitle(1),
    description: selectDescription(1),
    image: {
      srcset: selectImageSrcset(1),
    },
  },
  {
    title: selectTitle(2),
    description: selectDescription(2),
    image: {
      srcset: selectImageSrcset(2),
    },
  },
].map((section) => ({
  ...section,
  image: { ...section.image, sizes: IMAGE_SIZES, loader: IMAGE_LOADER },
}));

@asyncLoad([
  ({ store: { dispatch } }) =>
    dispatch(loadMarketing(`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/home-page`)),
])
@connect(
  (state) => ({
    user: state.auth.user,
    list: state.variantList,
    marketing: state.marketing[`${__COUNTRY__.toLocaleLowerCase()}/general-content/main-pages/home-page`],
  }),
  null
)
@wrapPage()
@withUseBreakpoints
export default class TradeProgram extends React.Component {
  static propTypes = {
    breakpoints: PropTypes.object,
  };

  render() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    return (
      <div className={style.trade}>
        <div className={`${style.trade}__wrapper`}>
          <Container>
            <PageHeader
              className={`${style.trade}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: selectBannerPic('mobile'),
                  loader: { ratio: '0.813333333' },
                },
                {
                  breakpoint: 'lg',
                  srcset: selectBannerPic('desktop'),
                  loader: { ratio: '0.416666667' },
                },
              ]}
              lazy={false}
              title="Trade Program"
              mainTitle={lang.t('pages.trade.name')}
              mainIntro={lang.t('pages.trade.mainIntro')}
              subTitle={lang.t('pages.trade.subTitle')}
              subIntro={lang.t('pages.trade.subIntro')}
            />

            <div className={`${style.trade}__sections`}>
              <ReactPicture
                className={`${style.trade}__section-begin`}
                {...SECTIONS[1].image}
                alt={SECTIONS[1].title}
              />
              {SECTIONS.map((section, index) => (
                <div key={index} className={`${style.trade}__section`}>
                  <ReactPicture className={`${style.trade}__section-img`} {...section.image} alt={section.title} />
                  <h4 className={`${style.trade}__section-title`}>{section.title}</h4>
                  <div className={`${style.trade}__section-description`}>{section.description}</div>
                  {section.info && <div className={`${style.trade}__section-info`}>{section.info}</div>}
                </div>
              ))}
              <ReactPicture className={`${style.trade}__section-end`} {...SECTIONS[2].image} alt={SECTIONS[2].title} />
            </div>

            <div className={`${style.trade}__join`}>
              <TicketForm
                formName="Join Our Program"
                title="Join Our Program"
                description={selectFormHeader(desktop ? 'desktop' : 'mobile')}
              />
            </div>

            <div className={`${style.trade}__social`}>
              <SocialSection posts={this.props.marketing.data.story.content.instagram} />
            </div>
          </Container>
        </div>
      </div>
    );
  }
}
