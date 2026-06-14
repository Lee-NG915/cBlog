import React from 'react';
import { wrapPage, withUseBreakpoints } from 'utils/page';
import Banner from 'components/Banner';
import ReactPicture from 'components/ReactPicture';
import { Link } from 'react-router';
import { cloudinaryRoot } from 'config';
import { getUrl } from 'pages';
import Spinner from 'components/Spinner';
import { addKnightPrefix } from 'pages/util.js';
import { Container } from '@castlery/fortress';
import PropTypes from 'prop-types';
import style from './style.scss';

@wrapPage()
@withUseBreakpoints
export default class zip extends React.Component {
  static propTypes = {
    breakpoints: PropTypes.object,
  };

  state = {
    loading: true,
  };

  componentDidMount() {
    // FIXME can use Script Component
    if (__ZIP_PUBLIC_KEY__) {
      this.loadScript('https://static.zipmoney.com.au/lib/js/zm-widget-js/dist/zip-widget.min.js');
      this.hackZipLandingPage();
    }
  }

  componentWillUnmount() {
    this.observer?.disconnect();
  }

  modifyLandingPage(landingPageIframe) {
    const iframeDoc = landingPageIframe.contentDocument || landingPageIframe.contentWindow.document;
    if (iframeDoc) {
      const brandContent = iframeDoc.querySelector('.brand-content');
      brandContent?.remove();

      const cardText = iframeDoc.querySelector('.card p');
      if (cardText) {
        cardText.textContent = 'We pay the store, you order the goods.';
      }

      iframeDoc.querySelectorAll('a').forEach((aLink) => {
        aLink.setAttribute('target', '_blank');
      });
    }
  }

  hackZipLandingPage() {
    this.observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        if (mutation.addedNodes && mutation.addedNodes[0]) {
          this.setState({
            loading: false,
          });
          // tweak zip landing page
          const landingPageIframe = mutation.addedNodes[0];

          this.modifyLandingPage(landingPageIframe);
          // fix for firefox
          landingPageIframe.onload = () => {
            this.modifyLandingPage(landingPageIframe);
          };
        }
      });
    });
    this.observer.observe(this.zipRef.current, {
      childList: true,
    });
  }

  loadScript(src) {
    if (window.Zip && window.Zip.Widget) {
      return;
    }
    const request = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => {
        resolve();
      };
      s.onerror = () => {
        reject('Error in loading script.');
      };
      document.head.appendChild(s);
    });

    return request;
  }

  zipRef = React.createRef();

  render() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    const IMAGE_LINKS = [
      {
        url: getUrl(addKnightPrefix('sofas')),
        src: !desktop
          ? `${cloudinaryRoot}/v1553065129/static/landing/living-room-mobile.png`
          : `${cloudinaryRoot}/v1553065130/static/landing/living-room-desktop.png`,
        title: 'Sofas',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
      {
        url: getUrl(addKnightPrefix('beds')),
        src: !desktop
          ? `${cloudinaryRoot}/v1553065128/static/landing/bedroom-mobile.png`
          : `${cloudinaryRoot}/v1553065128/static/landing/bedroom-desktop.png`,
        title: 'Beds',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
      {
        url: getUrl(addKnightPrefix('tables')),
        src: !desktop
          ? `${cloudinaryRoot}/v1553065129/static/landing/dining-room-mobile.png`
          : `${cloudinaryRoot}/v1553065128/static/landing/dining-room-desktop.png`,
        title: 'Tables',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
      {
        url: getUrl(addKnightPrefix('accessories')),
        src: !desktop
          ? `${cloudinaryRoot}/v1553065128/static/landing/accessories-mobile.png`
          : `${cloudinaryRoot}/v1553065132/static/landing/accessories-desktop.png`,
        title: 'Accessories',
        loader: {
          ratio: !desktop ? 1 : 0.758,
        },
      },
    ];

    return (
      <div className={style.zip}>
        <div className={`${style.zip}__wrapper`}>
          <Container>
            <Banner
              className={`${style.zip}__banner`}
              mediaQueries={[
                {
                  breakpoint: 'xs',
                  srcset: '/v1553065134/static/landing/zippay-mobile.png',
                  loader: {
                    ratio: 0.8133,
                  },
                },
                {
                  breakpoint: 'lg',
                  srcset: '/v1553065140/static/landing/zippay-desktop.png',
                  loader: {
                    ratio: 0.4167,
                  },
                },
              ]}
              title="Zip, own it now, pay later"
            >
              <div className={`${style.zip}__header`}>
                <ReactPicture
                  className={`${style.zip}__logo`}
                  alt="zip logo"
                  src={`${cloudinaryRoot}/v1553065124/static/landing/zippay-logo.png`}
                />
                <h1 className={`${style.zip}__title`}>Own It Now, Pay Later</h1>
              </div>
            </Banner>

            <div className={`${style.zip}__intro`}>
              <h2 className={`${style.zip}__intro-title`}>Buy furniture with Zip</h2>
              <div className={`${style.zip}__intro-detail`}>
                Castlery Australia is one of the Zip furniture stores in Australia. We understand how important flexible
                and interest free payment options are for our customers. Hence, we are excited to partner together with
                Zip, offering you an alternative payment solution to buy furniture at our store now and pay later.
              </div>
            </div>

            {this.state.loading && (
              <div className={`${style.zip}__spinner`}>
                <Spinner />
              </div>
            )}
            <div data-zm-merchant={__ZIP_PUBLIC_KEY__} data-env="production" />
            <div
              className={`${style.zip}__zip-landing`}
              id="zip-LP"
              data-zm-asset="landingpage"
              data-zm-widget="inline"
              ref={this.zipRef}
            />

            <div className={`${style.zip}__links`}>
              {IMAGE_LINKS.map((link, index) => (
                <Link key={index} href={`${__BASE_URL__}${link.url}`} className={`${style.zip}__link`}>
                  <ReactPicture alt={link.title} loader={link.loader} srcset={link.src} />
                  <h4 className={`${style.zip}__link-title`}>{link.title}</h4>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      </div>
    );
  }
}
