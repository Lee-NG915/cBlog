import React, { useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import ApiClient from 'helpers/ApiClient';
import debounce from 'utils/debounce';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import { v4 as uuidV4 } from 'uuid';
import { zipcodeFormatUtil, regionalZipcodeFormatForValidate } from 'config';
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import style from './style.scss';

const GooglePlacesAutocomplete = ({
  onSelect,
  onBlur = () => {},
  onEnter,
  type,
  theme,
  autoFocus,
  className,
  placeholder,
  onBackupValueChange,
}) => {
  const [query, setQuery] = useState('');
  const [backupValue, setBackupValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const isZipCode = type === 'zipcode';
  const client = useRef(new ApiClient());

  const sessionToken = useMemo(() => uuidV4(), []);

  const isZipcodeValid = (zipcode) => {
    if (!isZipCode) {
      return true;
    }
    return postcodeValidatorExistsForCountry(__COUNTRY__) && postcodeValidator(zipcode, __COUNTRY__);
  };

  const onFetch = useRef(
    debounce((value = '') => {
      const escapedValueString = value?.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedValue =
        isZipCode && typeof regionalZipcodeFormatForValidate === 'function'
          ? regionalZipcodeFormatForValidate(escapedValueString)
          : escapedValueString;
      let suggestionsData = [];
      onBackupValueChange?.('');
      setBackupValue('');
      if (escapedValue.length !== 0) {
        if (!isZipCode) {
          suggestionsData = [
            {
              name: 'Not Found',
            },
          ];
        }
        setLoading(true);
        client.current
          .get('/places/autocomplete', {
            params: {
              query: escapedValue,
              type,
              sessiontoken: sessionToken,
            },
          })
          .then((response) => {
            /**
             * [{
             *    "description": "1426 F Street, Sacramento, CA, USA",
             *    "google_place_id": "ChIJGdVRVtHQmoARgL20aBUA-Eo"
             *  },...]
             */
            suggestionsData.splice(0, 0, ...response);
          })
          .catch((error) => {
            console.error(JSON.stringify({ message: 'GooglePlacesAutocomplete autocomplete error', error }, null, 2));
          })
          .finally(() => {
            if (isZipCode && suggestionsData.length === 0) {
              // When a valid zipcode is entered but no results are found, add fallback logic to use the backup value as the zipcode for submission.
              if (isZipcodeValid(value)) {
                setBackupValue(value);
                onBackupValueChange?.(value);
                suggestionsData.push({
                  type: 'zipcode-not-found',
                  description: `Couldn't find a location for this code.`,
                });
              } else {
                onBackupValueChange?.('');
                setBackupValue('');
                suggestionsData.push({
                  type: 'zipcode-not-found',
                  description: `Please enter a valid code.`,
                });
              }
            }

            setSuggestions(suggestionsData);
            setLoading(false);
          });
      } else {
        setSuggestions(suggestionsData);
      }
    }, 500)
  );

  const onSuggestionsFetchRequested = useCallback(
    ({ value }) => {
      if (isZipCode) {
        const isMoreThan3 = value?.replace(/\s+/g, '')?.length >= 3;
        if (isMoreThan3) {
          onFetch.current(value);
        } else {
          setSuggestions([]);
        }
      } else {
        onFetch.current(value);
      }
    },
    [onFetch, isZipCode]
  );

  const onSuggestionsClearRequested = useCallback(() => {
    setSuggestions([]);
  }, []);

  const getSuggestionValue = useCallback((suggestion) => suggestion.description, []);

  const renderSuggestion = useCallback(
    (suggestion) => {
      if (suggestion.name) {
        return (
          <button type="button" className={`${style.autosuggest}__btn`}>
            Can't find your address?
          </button>
        );
      }
      if (suggestion.type === 'zipcode-not-found') {
        return (
          <button type="button" className={`${style.autosuggest}__btn ${style.autosuggest}__not-found`} disabled>
            {getSuggestionValue(suggestion)}
          </button>
        );
      }
      return (
        <button type="button" className={`${style.autosuggest}__btn`}>
          {getSuggestionValue(suggestion)}
        </button>
      );
    },
    [getSuggestionValue]
  );

  const onSuggestionSelected = useCallback(
    async (e, { suggestion }) => {
      e.preventDefault();
      if (suggestion.type === 'zipcode-not-found') {
        return null;
      }
      if (onSelect) {
        if (suggestion.name === 'Not Found') {
          onSelect(suggestion);
          return suggestion;
        }
        setLoading(true);
        try {
          const address = await client.current.get('/places/formatted_address', {
            params: {
              google_place_id: suggestion.google_place_id,
              sessiontoken: sessionToken,
            },
          });
          const sanitizedAddress = Object.keys(address).reduce((acc, cur) => {
            if (address[cur]) {
              acc[cur] = address[cur];
            }
            return acc;
          }, {});
          const selectResult = {
            ...sanitizedAddress,
            google_place_id: suggestion.google_place_id,
            state: sanitizedAddress.state_name,
            description: suggestion.description,
          };
          onSelect(selectResult);
          return selectResult;
        } catch (error) {
          console.error('🚀 ~ file: GooglePlacesAutocomplete.js:138 ~ GooglePlacesAutocomplete ~ error:', error);
          return null;
        } finally {
          setLoading(false);
        }
      }
      return null;
    },
    [onSelect, sessionToken]
  );

  const onChange = useCallback(
    (event, { newValue, method }) => {
      if (
        ['click', 'enter'].includes(method) &&
        suggestions?.length === 1 &&
        suggestions?.[0]?.type === 'zipcode-not-found'
      ) {
        return;
      }
      const canTransferValue = method === 'type' && isZipCode;
      const value =
        canTransferValue && typeof zipcodeFormatUtil === 'function' ? zipcodeFormatUtil(newValue) : newValue;
      setQuery(value);
    },
    [isZipCode, suggestions]
  );

  const handleKeyDown = useCallback(
    async (event) => {
      if (loading) {
        return false;
      }

      if (event.key === 'Enter' && suggestions.length > 0) {
        event.preventDefault();
        const firstSuggestion = suggestions?.[0];
        if (firstSuggestion && firstSuggestion.type !== 'zipcode-not-found') {
          const result = await onSuggestionSelected(event, { suggestion: firstSuggestion });
          if (result) {
            setQuery(result.description);
            onEnter?.(event, { cityInfo: result });
          }
        } else if (firstSuggestion?.type === 'zipcode-not-found' && backupValue) {
          onEnter?.(event, {
            cityInfo: {
              state: '',
              city: '',
              zipcode: backupValue,
            },
          });
        }
      }
    },
    [suggestions, onSuggestionSelected, loading, backupValue, onEnter]
  );

  const initTheme = useMemo(
    () => ({
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
        backgroundColor: '#FBF9F4',
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
        backgroundColor: '#FBF9F4 !important',
        borderRadius: 0,
        zIndex: 101,
        maxHeight: '50vh',
        overflowY: 'auto',
        padding: 0,
        // backgroundColor: 'blue',
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
      },
      suggestion: {
        cursor: 'pointer',
        padding: '0px',
        listStyleType: 'none',
        lineHeight: 1.2,
        fontFamily: 'Aime, Helvetica Neue, Arial, sans-serif',
        fontWeight: 400,
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
    }),
    [suggestions]
  );

  const inputProps = {
    type: 'search',
    placeholder: placeholder || 'Enter your address',
    className: 'form-control',
    value: query || '',
    name: 'q',
    maxLength: '2048',
    autoCorrect: 'off',
    autoFocus,
    spellCheck: false,
    onChange,
    onBlur,
    onKeyDown: handleKeyDown,
  };

  return (
    <div className={classNames(style.autosuggest, style.googlePlacesAutocomplete, className)}>
      <Autosuggest
        theme={theme || initTheme}
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
      />
      {loading && <Spinner className={type === 'zipcode' ? `${style.autosuggest}__spinner--zipcode` : ''} right />}
    </div>
  );
};

GooglePlacesAutocomplete.propTypes = {
  onSelect: PropTypes.func,
  onBlur: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  theme: PropTypes.object,
  autoFocus: PropTypes.bool,
  onBackupValueChange: PropTypes.func,
  onEnter: PropTypes.func,
};

export default GooglePlacesAutocomplete;
