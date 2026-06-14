import React from 'react';
import PropTypes from 'prop-types';
import LazyLoad from 'react-lazyload';
import { Link } from 'react-router';

import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';

import { wrapPage, withUseBreakpoints } from 'utils/page';
import lang from 'utils/lang';

import { Container } from '@castlery/fortress';
import showcasingIcon from '../images/showcasing.svg';
import photoIcon from '../images/photo.svg';
import likeIcon from '../images/like.svg';

import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class StyleContest extends React.Component {
  static contextTypes = {
    frame: PropTypes.object,
  };

  static propTypes = {
    breakpoints: PropTypes.object,
  };

  prizes = [
    // {
    //   key: 'best',
    //   title: 'Best Photo Award: <br /> $500 Voucher',
    //   desc: 'We’ll pick the photo with the best <br/> styling and quality, so make it <br/> insta-worthy!',
    // },
    {
      key: 'popular',
      title: 'Prize: $500 Voucher',
      desc: 'We’ll pick 1 winner based on the photo with the best styling and quality, so make it insta-worthy! Likes and comments are taken into consideration too ;)',
    },
  ];

  methods = [
    {
      key: 'showcasing',
      icon: showcasingIcon,
      desc: 'Style any room or space in your home <strong>prominently showcasing</strong> at least one Castlery product.',
    },
    {
      key: 'photo',
      icon: photoIcon,
      desc: `Snap your best photo of your styled space and post it on your public Instagram account. Don’t forget to tag and mention us <a href='${lang.t(
        'social.instagram'
      )}' target="_blank">${lang.t(
        'social.ig-handle'
      )}</a> as well as hashtag <a href='https://www.instagram.com/explore/tags/castlerystylingcontest/' target="_blank">#castlerystylingcontest</a>`,
    },
    {
      key: 'like',
      icon: likeIcon,
      desc: 'Spread the word! Get as many friends to like your photo.',
    },
  ];

  inspirationCollections = [
    {
      title: 'Photo by:  @larc.sg and @sgmrshopperstudio',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/miles-bed.png',
      links: [
        {
          name: 'Miles Bed',
          url: '/products/miles-bed',
        },
        // {
        //   name: 'Miles Bedside table',
        //   url: '/products/miles-bedside-table',
        // },
      ],
    },
    {
      title: 'Photo by:  @everyday.muse',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/chelsea-marble-dining-table.png',
      links: [
        {
          name: 'Chelsea Marble Dining Table',
          url: '/products/chelsea-marble-dining-table',
        },
        {
          name: 'Raymond Pendant Light',
          url: '/products/raymond-pendant-light',
        },
      ],
    },
    {
      title: 'Photo by:  @styledbypt',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/hugh-sofa.png',
      links: [
        {
          name: 'Hugh Sofa Sectional',
          url: '/products/hugh-sofa-sectional',
        },
      ],
    },
    {
      title: 'Photo by:  @housetwentyfive',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/todd-sofa.png',
      links: [
        {
          name: 'Todd Sectional Chaise Sofa',
          url: '/products/todd-sectional-chaise-sofa',
        },
      ],
    },
    {
      title: 'Photo by:  @houseofchais',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/seb-bench.png',
      links: [
        {
          name: 'Seb Dining Bench',
          url: '/products/seb-dining-bench',
        },
      ],
    },
    {
      title: 'Photo by:  @tinkertineslifestyle',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/torri-chairs.png',
      links: [
        {
          name: 'Torri Bar Stool',
          url: '/products/torri-bar-stool',
        },
      ],
    },
    {
      title: 'Photo by:  @styledbypt',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/miles-sideboard.png',
      links: [
        {
          name: 'Miles Sideboard',
          url: '/products/miles-sideboard-160cm',
        },
      ],
    },
    {
      title: 'Photo by:  @everyday.home',
      image: 'https://res.cloudinary.com/castlery/image/upload/v1568638649/static/style-contest/sand-tableware.png',
      links: [
        {
          name: 'Sand Tableware Set',
          url: '/collections/sand-collection',
        },
        // {
        //   name: 'Vaila Glass Set',
        //   url: '/search?q=valia',
        // },
        {
          name: 'Tobe Cutlery Set',
          url: '/products/tobe-16-piece-cutlery-set',
        },
      ],
    },
    {
      title: 'Photo by:  @songe_lab',
      image: 'https://res.cloudinary.com/castlery/image/upload/static/style-contest/chelsea-and-joshua.png',
      links: [
        {
          name: 'Chelsea Marble Dining Table',
          url: '/products/chelsea-marble-dining-table',
        },
        {
          name: 'Joshua Oak Chairs',
          url: '/products/joshua-chair-oak',
        },
      ],
    },
  ];

  showImageModal = (index) => {
    const { frame } = this.context;
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    frame.openModal('image', {
      images: this.inspirationCollections.map((inspiration) =>
        inspiration.image.replace(
          /upload\//,
          !desktop ? 'upload/w_1000,f_auto,q_auto/' : 'upload/w_2000,f_auto,q_auto/'
        )
      ),
      initialIndex: index,
    });
  };

  renderImage = (link, alt, ratio, width, lazy = true) => {
    const image = <ReactPicture srcset={`${link}`} alt={alt} loader={{ ratio }} />;

    if (lazy) {
      return (
        <LazyLoad offset={300} once height={300}>
          {image}
        </LazyLoad>
      );
    }
    return image;
  };

  render() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    return (
      <div className={style.styleContest}>
        <div className={`${style.styleContest}__wrapper`}>
          <Container>
            <Banner
              className={`${style.styleContest}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: '/static/style-contest/contest-v2-mobile.jpg',
                  loader: { ratio: '0.813333333' },
                },
                {
                  breakpoint: 'lg',
                  srcset: '/static/style-contest/contest-v2.jpg',
                  loader: { ratio: '0.416666667' },
                },
              ]}
              lazy={false}
              title="Style Contest"
            >
              <div className={`${style.styleContest}__header`}>
                <h1 className={`${style.styleContest}__header-title`}>
                  Castlery {!desktop ? <br /> : ''} Styling Contest
                </h1>
                <div className={`${style.styleContest}__header-subTitle`}>Win a $500 Voucher!</div>
              </div>
            </Banner>
            <div className={`${style.styleContest}__intro`}>
              <h2 className={`${style.styleContest}__intro-title`}>Showcase Your Inner Stylist!</h2>
              <div className={`${style.styleContest}__intro-detail`}>
                Upload an Instagram photo of your home styled with Castlery product(s) and win a $500 Castlery voucher.
              </div>
            </div>

            <Container maxWidth="md" className={`${style.styleContest}__prizes`}>
              <h3 className={`${style.styleContest}__title`}>1 Winner To be Chosen</h3>
              <div className={`${style.styleContest}__prizes-content`}>
                {this.prizes.map((prize) => (
                  <div
                    key={prize.key}
                    className={`${style.styleContest}__prize ${style.styleContest}__prize--${prize.key}`}
                  >
                    <h4
                      className={`${style.styleContest}__prize-title`}
                      dangerouslySetInnerHTML={{ __html: prize.title }}
                    />
                    <div
                      className={`${style.styleContest}__prize-desc`}
                      dangerouslySetInnerHTML={{ __html: prize.desc }}
                    />
                  </div>
                ))}
              </div>
            </Container>

            <Container maxWidth="md" className={`${style.styleContest}__methods`}>
              <h3 className={`${style.styleContest}__title`}>How To Win</h3>
              <div className={`${style.styleContest}__methods-content`}>
                {this.methods.map((method) => (
                  <div key={method.key} className={`${style.styleContest}__method`}>
                    <img src={method.icon} alt={method.key} />
                    <div
                      className={`${style.styleContest}__method-desc`}
                      dangerouslySetInnerHTML={{ __html: method.desc }}
                    />
                  </div>
                ))}
              </div>
            </Container>

            <Container maxWidth="md" className={`${style.styleContest}__collections`}>
              <h3 className={`${style.styleContest}__title`}>Be Inspired</h3>
              <div className={`${style.styleContest}__collections-content`}>
                {this.inspirationCollections.map((inspiration, index) => (
                  <div key={index} className={`${style.styleContest}__inspiration`}>
                    <div
                      className={`${style.styleContest}__inspiration-image`}
                      onClick={() => this.showImageModal(index)}
                    >
                      {this.renderImage(inspiration.image, 1, 0.33, {
                        alt: inspiration.title,
                      })}
                    </div>
                    <h4 className={`${style.styleContest}__inspiration-title`}>{inspiration.title}</h4>
                    <div className={`${style.styleContest}__inspiration-footer`}>
                      <div className={`${style.styleContest}__inspiration-featured`}>Featured:</div>
                      <div className={`${style.styleContest}__inspiration-links`}>
                        {inspiration.links.map((link) =>
                          link.url ? (
                            <div key={link.name} className={`${style.styleContest}__inspiration-link`}>
                              <Link to={link.url}>{link.name}</Link>
                            </div>
                          ) : (
                            link.name
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Container>

            <div className={`${style.styleContest}__contact`}>
              Follow us on Instagram{' '}
              <a href={lang.t('social.instagram')} target="_blank">
                {lang.t('social.ig-handle')}
              </a>{' '}
              for more home inspirations.
            </div>

            <Container maxWidth="md" className={`${style.styleContest}__terms`}>
              <div className={`${style.styleContest}__terms-container`}>
                <h2 className={`${style.styleContest}__terms-title`}>Terms & Conditions</h2>
                <ul className={`${style.styleContest}__terms-content`}>
                  <li>
                    The contest starts 15 January 2020 and will end 31 March 2020 23:59 (AEDT). After this date, no
                    further entries to the competition will be permitted.
                  </li>
                  <li>
                    The prize is a $500 Castlery voucher with no minimum spend to be used storewide in the next Castlery
                    order.
                  </li>
                  <li>Multiple entries from the same Instagram account are permitted.</li>
                  <li>All entries become and remain the property of Castlery Pty Ltd.</li>
                  <li>
                    Winner will be announced on Castlery’s Instagram post and will be contacted via Instagram Direct
                    Message. If the winner cannot be contacted by a stipulated date, Castlery reserves the right to
                    withdraw the prize from the winner and pick a replacement winner.
                  </li>
                  <li>Castlery will notify the winner about how to collect the prize.</li>
                  <li>
                    The contest is open to residents of Australia, except employees of Castlery (and its parent company
                    and/or subsidiaries) and their close relatives and anyone otherwise connected with the organisation
                    or judging of the competition.
                  </li>
                  <li>
                    Chance plays no part in determining the winner. Each photo entry will be individually judged, based
                    upon individual creative merit. All entries must be an independent creation by the entrant and free
                    of any claims that they infringe any third party rights. Entries must not have been published
                    previously and/or have been used to win prizes in any other competitions.
                  </li>
                  <li>
                    Castlery reserves the right to disqualify any entrant submitting an entry which, in Castlery’s
                    opinion, violates fair play or legitimate participation in the contest such as suspicious garnering
                    of votes or engagement, or includes irrelevant or objectionable content including but not limited to
                    profanity, nudity, potentially insulting, scandalous, inflammatory or defamatory images or language
                  </li>
                  <li>
                    Castlery’s decision in respect of all matters to do with the competition will be final and no
                    correspondence will be entered into.
                  </li>
                  <li>
                    The prize is non-redeemable and non-exchangeable for cash. Any attempt to resell or auction all or
                    any part of this prize will result in an immediate cancellation of the prize.
                  </li>
                  <li>
                    The winner agrees to the use of his/her name and image in any publicity material, as well as their
                    entry.
                  </li>
                  <li>
                    Castlery reserves the right to cancel or amend the competition and these terms and conditions
                    without notice in the event of a catastrophe, war, civil or military disturbance, act of God or any
                    actual or anticipated breach of any applicable law or regulation or any other event outside of
                    Castlery’s control. Any changes to the competition will be notified to entrants as soon as possible
                    by Castlery.
                  </li>
                  <li>
                    The contest is in no way sponsored, endorsed, administrated or associated with Facebook and/or
                    Instagram.{' '}
                  </li>
                  <li>
                    By entering this competition, an entrant is indicating his/her agreement to be bound by these terms
                    and conditions.
                  </li>
                </ul>
              </div>
            </Container>
          </Container>
        </div>
      </div>
    );
  }
}
