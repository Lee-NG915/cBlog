import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleMap from 'components/GoogleMap';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { loadIfNeeded as loadStores } from 'redux/modules/stores';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@connect(
  (state) => ({
    stores: state.stores,
  }),
  { loadStores }
)
@withUseBreakpoints
export default class Studio extends Component {
  static propTypes = {
    stores: PropTypes.object,
    loadStores: PropTypes.func,
    title: PropTypes.bool,
    studioTitle: PropTypes.string,
    studioBtnText: PropTypes.string,
    studioBtnStyle: PropTypes.string,
    studioFilter: PropTypes.func,
    initialStudio: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    goToStep: PropTypes.func,
    setRetail: PropTypes.func,
  };

  static defaultProps = {
    studioTitle: 'Studio Info',
    studioBtnText: 'Select Studio',
    studioBtnStyle: 'btn-green',
    studioFilter: (studios) => studios.filter((s) => s.is_public),
  };

  state = {
    error: '',
    chosenRetailIndex: 0,
  };

  UNSAFE_componentWillMount() {
    this.props
      .loadStores()
      .then((stores) => {
        if (this.props.initialStudio) {
          const index = this.props.studioFilter(stores).findIndex((s) => s.slug === this.props.initialStudio);
          if (index !== -1) {
            this.setState({
              chosenRetailIndex: index,
            });
          }
        }
      })
      .catch((error) =>
        this.setState({
          error: error.errors[0].detail,
        })
      );
  }

  chooseRetail(index) {
    this.setState({
      chosenRetailIndex: index,
    });
  }

  render() {
    const { error, chosenRetailIndex } = this.state;
    const { studioFilter, breakpoints = {} } = this.props;
    const { loading, data: _retails = [] } = this.props.stores;
    const { desktop } = breakpoints;
    const retails = studioFilter(_retails);
    const chosenRetail = retails[chosenRetailIndex];

    let mapOptions;
    if (chosenRetail) {
      if (!desktop) {
        mapOptions = {
          center: { lat: chosenRetail.lat, lng: chosenRetail.lng },
          width: 360,
          height: 240,
          zoom: 16,
          static: true,
        };
      } else {
        mapOptions = {
          center: { lat: chosenRetail.lat, lng: chosenRetail.lng },
          zoom: 17,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        };
      }
    }

    return (
      <div className={style.studio}>
        {loading ? (
          <div className={`${style.studio}__loading`}>
            <Spinner />
          </div>
        ) : retails.length > 0 ? (
          <div>
            {this.props.title && <div className={style.header}>{this.props.studioTitle}</div>}
            {retails.length > 1 && (
              <div className={`${style.studio}__retails`}>
                {retails.map((retail, index) => (
                  <button
                    key={retail.id}
                    type="button"
                    onClick={() => this.chooseRetail(index)}
                    className={classNames('btn', {
                      'is-active': chosenRetailIndex === index,
                    })}
                  >
                    {retail.name}
                  </button>
                ))}
              </div>
            )}
            <div className={`${style.studio}__body`}>
              <div className={`${style.studio}__map__wrapper`}>
                <GoogleMap options={mapOptions} className={`${style.studio}__map`} />
              </div>
              <div className={`${style.studio}__info`}>
                <h3>{chosenRetail && chosenRetail.name}</h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: chosenRetail && chosenRetail.address,
                  }}
                />
                <p
                  dangerouslySetInnerHTML={{
                    __html: chosenRetail && chosenRetail.operating_hours,
                  }}
                />
                <p>Phone: {chosenRetail && chosenRetail.contact_number}</p>
                {chosenRetail && chosenRetail.appointment_available && (
                  <button
                    type="button"
                    onClick={() => {
                      this.context.setRetail(chosenRetail.id, chosenRetail.name);
                      this.context.goToStep('timing');
                    }}
                    className={classNames('btn', this.props.studioBtnStyle)}
                  >
                    {this.props.studioBtnText}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${style.studio}__error`}>{error}</div>
        )}
      </div>
    );
  }
}
