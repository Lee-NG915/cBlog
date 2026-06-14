import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import Spinner from 'components/Spinner';
import debounce from 'utils/debounce';
import classNames from 'classnames';
import StandardInput from 'components/Form/StandardInput';
import { getCityByZipCode as getCityInfo } from 'redux/modules/address';
import { connect } from 'react-redux';
import { getCites } from 'api/search';
import config from 'config';
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import style from './style.scss';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

@connect(null, (dispatch) => ({
  getCityByZipCode: (zipCode) => dispatch(getCityInfo(zipCode)),
}))
export default class CitySearch extends Component {
  static propTypes = {
    onSelect: PropTypes.func, // called if one suggestion is selected
    onChange: PropTypes.func, // called if input is changeed
    onBlur: PropTypes.func,
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    value: PropTypes.object, // initial value
    disabled: PropTypes.bool, // whether disable input field
    theme: PropTypes.object, // style from autosuggest see https://www.npmjs.com/package/react-autosuggest#theme-prop
    clearValueFlag: PropTypes.any, // use for clear value
    useGooglePlace: PropTypes.bool, // use google place autocomplete
    getCityByZipCode: PropTypes.func,
    onEnter: PropTypes.func,
    onBackupValueChange: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    disabled: false,
    autoFocus: false,
    useGooglePlace: config.googlePlaceEnabledInSearchZipcode,
  };

  static escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static formAddress(address) {
    const { city = '', state = '', zipcode = '' } = address;

    const address2Arr = [];
    if (city !== '') {
      address2Arr.push(city);
    }
    if (state !== '' || zipcode !== '') {
      address2Arr.push(`${state} ${zipcode}`.trim());
    }
    return address2Arr.join(', ');
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      value: CitySearch.formAddress(props.value),
      suggestions: [],
      selectedCity: props.value,
      selectedCityString: CitySearch.formAddress(props.value).toLowerCase(),
      cityInfo: {},
    };
  }

  componentDidUpdate(preProps) {
    const { clearValueFlag } = this.props;
    if (clearValueFlag !== preProps.clearValueFlag) {
      this.setState({ value: '' });
    }
  }

  onFetch = debounce((value) => {
    const escapedValue = CitySearch.escapeRegexCharacters(value.trim());
    let suggestions = [];

    this.setState({
      loading: true,
    });
    if (escapedValue.length !== 0) {
      suggestions = [
        {
          name: 'Not Found',
        },
      ];
      getCites({
        q: escapedValue,
        size: 100,
      })
        .then((response) => {
          if (response?.length === 0) {
            suggestions.splice(0, 0, ...response);
          } else {
            suggestions = response;
          }
          this.setState({
            suggestions,
            loading: false,
          });
        })
        .catch(() => {
          this.setState({
            suggestions,
            loading: false,
          });
        });
    } else {
      this.setState({
        suggestions,
      });
    }
  }, 200);

  onSuggestionsFetchRequested = ({ value }) => {
    this.onFetch(value);
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  getSuggestionValue = (suggestion) => {
    if (suggestion.name) {
      return '';
    }
    return CitySearch.formAddress(suggestion);
  };

  getCity = debounce((zipCode) => {
    const { getCityByZipCode, onSelect } = this.props;

    const searchCityByZipCode = () =>
      getCityByZipCode(zipCode)
        .then((response) => {
          this.setState({ cityInfo: response });
          onSelect && onSelect(response);
        })
        .catch((err) => {
          const errorInfo = 'Invalid Zip Code or Not Supported Zip Code';
          onSelect && onSelect({});
          this.setState({ cityInfo: { error: true, errorInfo } });
        });

    if (postcodeValidatorExistsForCountry(__COUNTRY__)) {
      const isRuleValid = postcodeValidator(zipCode, __COUNTRY__);
      if (!isRuleValid) {
        this.setState({ cityInfo: { error: true, errorInfo: 'Invalid Zip Code or Not Supported Zip Code' } });
        return;
      }
    }
    searchCityByZipCode();
  }, 600);

  renderSuggestion = (suggestion) => {
    if (suggestion.name) {
      return (
        <button type="button" className="btn">
          Not Found
        </button>
      );
    }
    return (
      <button type="button" className="btn">
        {CitySearch.formAddress(suggestion)}
      </button>
    );
  };

  onSuggestionSelected = (e, { suggestion }) => {
    // form submission
    e.preventDefault();

    const selectedLocation = {
      zipcode: suggestion.zipcode,
      city: suggestion.city,
      state: suggestion.state,
    };

    this.setState({
      selectedCity: selectedLocation,
      selectedCityString: CitySearch.formAddress(suggestion).toLowerCase(),
    });

    const { onSelect } = this.props;
    if (onSelect) {
      onSelect(selectedLocation);
    }
  };

  onPlaceSelected = (place) => {
    const { onSelect } = this.props;
    const selectedLocation = {
      zipcode: place.zipcode,
      city: place.city,
      state: place.state,
    };
    this.setState({
      selectedCity: selectedLocation,
      selectedCityString: CitySearch.formAddress(place),
    });
    if (onSelect) {
      onSelect(selectedLocation);
    }
  };

  onChange = (event, { newValue }) => {
    const { onChange, useGooglePlace } = this.props;
    const { selectedCity, selectedCityString } = this.state;
    // 对于输入的值进行格式化处理
    const valueStr = typeof config.zipcodeFormatUtil === 'function' ? config.zipcodeFormatUtil(newValue) : newValue;

    // console.log('useGooglePlace', useGooglePlace);
    // console.log('config.getCityByZipcodeEnabled', config.getCityByZipcodeEnabled);
    // if (!useGooglePlace && config.getCityByZipcodeEnabled) {
    //   // getCityByZipcodeEnabled:US,CA,UK
    //   this.getCity(valueStr);
    // }
    if (valueStr.toLowerCase().trim() !== selectedCityString && onChange) {
      // if user change input after selecting one city, clean the formsy field value
      onChange({});
    } else if (onChange && selectedCity) {
      onChange(selectedCity);
    }

    this.setState({
      value: valueStr,
    });
  };

  onEnter = (event, { cityInfo }) => {
    event.preventDefault();
    if (event.keyCode !== 13) {
      return;
    }
    const { onEnter } = this.props;
    onEnter && cityInfo && onEnter(event, cityInfo);
  };

  // const enabledAutoSuggestSearch=

  render() {
    const {
      className,
      disabled,
      theme,
      onBlur = () => {},
      autoFocus,
      useGooglePlace,
      onBackupValueChange,
    } = this.props;
    const { value, suggestions, loading, cityInfo } = this.state;

    const inputProps = {
      type: 'text',
      placeholder: config.placeholderInCitySearch,
      className: 'form-control',
      value,
      name: 'q',
      maxLength: '2048',
      autoCorrect: 'off',
      autoFocus,
      spellCheck: false,
      disabled,
      onChange: this.onChange,
      onBlur,
      'aria-label': 'Please input your Postcode',
    };

    const initTheme = {
      container: {
        position: 'relative',
        width: '100%',
      },
      input: {
        width: '100%',
        height: '52px',
        padding: '12px 50px 10px 20px',
        border: '1px solid #BEBEBE',
        outline: 'none',
        borderRadius: 0,
        position: 'relative',
        zIndex: 100,
        fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0,
        backgroundColor: '#FBF9F4 !important',
        '@media (min-width: 0px) and (max-width: 600px)': {
          fontSize: '1rem',
        },
        '@media (min-width: 601px) and (max-width: 900px)': {
          fontSize: '1rem',
        },
        '@media (min-width: 901px)': {
          fontSize: '1.125rem',
        },
      },
      suggestionsContainer: {
        position: 'absolute',
        top: '49px',
        width: '100%',
        border: suggestions.length > 0 ? '1px solid #BEBEBE' : 'none',
        backgroundColor: '#FBF9F4',
        borderRadius: 0,
        zIndex: 101,
        maxHeight: '50vh',
        overflowY: 'auto',
        // backgroundColor: 'blue',
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
        fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0,
        '@media (min-width: 0px) and (max-width: 600px)': {
          fontSize: '0.875rem',
        },
        '@media (min-width: 601px) and (max-width: 900px)': {
          fontSize: '0.875rem',
        },
        '@media (min-width: 901px)': {
          fontSize: '1rem',
        },
      },
      suggestion: {
        cursor: 'pointer',
        padding: '10px 20px',
        listStyleType: 'none',
      },
    };

    // config.autoSuggestSearchZipcodeEnabled :AU,SG
    return config.autoSuggestSearchZipcodeEnabled ? (
      <div className={classNames(style.autosuggest, className)}>
        <Autosuggest
          theme={theme || initTheme}
          suggestions={suggestions}
          focusInputOnSuggestionClick
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          onSuggestionSelected={this.onSuggestionSelected}
          inputProps={inputProps}
        />
        {loading && <Spinner className={`${style.autosuggest}__spinner`} right />}
      </div>
    ) : useGooglePlace ? (
      <GooglePlacesAutocomplete
        theme={theme}
        className={className}
        autoFocus={autoFocus}
        onSelect={this.onPlaceSelected}
        onBackupValueChange={onBackupValueChange}
        onBlur={onBlur}
        onEnter={this.onEnter}
        type="zipcode"
        placeholder={config.placeholderInCitySearch}
      />
    ) : (
      <div className={`${style.autosuggest}__zipcodeInput`}>
        <StandardInput
          placeholder="Zip Code"
          value={value}
          onChange={(e) => this.onChange(e, { newValue: e.target.value })}
          onKeyDown={(e) => {
            // if user press enter, submit the form
            if (e.keyCode === 13) {
              e.preventDefault();
              this.onEnter(e, { cityInfo });
            }
          }}
        />
        <div className={`${style.autosuggest}__zipcodeInput__info`}>
          {cityInfo?.error ? (
            <span>{cityInfo.errorInfo || ''}</span>
          ) : (
            <span>{cityInfo.city && `${cityInfo.city},${cityInfo.state} ${cityInfo.zipcode}`}</span>
          )}
        </div>
      </div>
    );
  }
}
