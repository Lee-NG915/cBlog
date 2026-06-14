import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage, withUseBreakpoints } from 'utils/page';
import { loadIfNeeded as loadStores } from 'redux/modules/stores';
import { connect } from 'react-redux';
import Slick from 'react-slick';
import ReactPicture from 'components/ReactPicture';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { getBreakpoint } from 'utils/breakpoints';
import { PrevBtn, NextBtn } from 'components/DesktopSlideButton';
import { GhostArrowBtn } from 'components/Button';
import { loadIfNeeded as loadEvents } from 'redux/modules/events';
import Helmet from 'react-helmet';
import { Container } from '@castlery/fortress';
import { getUserDevice } from 'utils/device';
import { enableDisplayContactNumber, enableIsOffLine } from 'config';
import { getLocalBusinessJsonLd } from './utils';
import style from './style.scss';

const device = getUserDevice();
const imageSize = {
  AU: {
    small: '0.824',
    large: '0.416',
  },
  SG: {
    small: '1.066',
    large: '0.313',
  },
};

@asyncLoad([
  ({ store: { dispatch } }) => dispatch(loadStores()),
  ({ store: { dispatch } }) => dispatch(loadEvents([1, 2])),
])
@connect((state) => ({
  stores: state.stores,
}))
@wrapPage({ pageType: 'Studio' })
@withUseBreakpoints
export default class Studio extends React.Component {
  static propTypes = {
    stores: PropTypes.object,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    size: device !== 'desktop' ? 'small' : 'large',
  };

  listenersByQuery = [];

  componentDidMount() {
    this.setMediaQuery();
  }

  componentWillUnmount() {
    this.listenersByQuery.forEach((remove) => remove());
  }

  setMediaQuery() {
    const mediaQueries = [
      {
        query: `(max-width: ${getBreakpoint('sm', 'max')}px)`,
        size: 'small',
      },
      {
        query: `(min-width: ${getBreakpoint('md', 'min')}px)`,
        size: 'large',
      },
    ];

    mediaQueries.forEach((mediaQuery) => {
      const mql = window.matchMedia(mediaQuery.query);
      const listener = (mq) => {
        if (mq.matches) {
          this.setState({
            size: mediaQuery.size,
          });
        }
      };
      mql.addListener(listener);
      this.listenersByQuery.push(() => {
        mql.removeListener(listener);
      });
      listener(mql);
    });
  }

  render() {
    const { stores, breakpoints = {} } = this.props;
    const { size } = this.state;
    const { frame } = this.context;
    const sgStoreData = stores?.data?.find((store) => store.is_public);
    const jsonLd = getLocalBusinessJsonLd(sgStoreData);
    const { desktop } = breakpoints;
    return (
      <div className={style.studio}>
        {enableIsOffLine && (
          <Helmet>
            <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
          </Helmet>
        )}
        {stores.data
          .filter((s) => s.is_public)
          .map((store) => (
            <div id={store.slug} className={`${style.studio}__store`} key={store.id}>
              <Container>
                <Slick
                  dots
                  infinite
                  draggable={false}
                  speed={500}
                  arrows={desktop}
                  prevArrow={desktop && <PrevBtn />}
                  nextArrow={desktop && <NextBtn />}
                >
                  {store[`image_${size}`].map((img, index) => (
                    <div key={index}>
                      <ReactPicture
                        srcset={img}
                        alt={`${store.name} ${index}`}
                        loader={{
                          ratio: imageSize[__COUNTRY__]?.[size],
                          widths: [640, 960, 1280, 1440, 1920, 2880],
                        }}
                        lazy={false}
                      />
                    </div>
                  ))}
                </Slick>
              </Container>

              <Container fixed>
                <div className={`${style.studio}__intro`}>
                  <h1>
                    {store.name}
                    {store.new && <span>New</span>}
                  </h1>
                  <p dangerouslySetInnerHTML={{ __html: store.intro }} />
                  <div className={`${style.studio}__intro__detail`}>
                    <div>
                      <div>
                        <h4>Location</h4>
                        <p dangerouslySetInnerHTML={{ __html: store.address }} />
                        <a href={store.url} target="_blank" rel="noopener">
                          {'How to get there >'}
                        </a>
                      </div>
                      {store.parking_info && (
                        <div>
                          <h4>Parking Info</h4>
                          <p
                            dangerouslySetInnerHTML={{
                              __html: store.parking_info,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div>
                        <h4>Opening Hours</h4>
                        <p
                          dangerouslySetInnerHTML={{
                            __html: store.operating_hours,
                          }}
                        />
                      </div>
                      {store.contact_number?.trim() && enableDisplayContactNumber && (
                        <div>
                          <h4>Contact Number</h4>
                          <p>{store.contact_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {store.appointment_available && (
                    <div className={`${style.studio}__intro__book`}>
                      <GhostArrowBtn
                        text="Book Your Appointment"
                        type="button"
                        onClick={() =>
                          frame.openModal('appointment', {
                            initialStudio: store.slug,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </Container>
            </div>
          ))}
      </div>
    );
  }
}
