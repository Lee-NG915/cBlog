import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import debounce from 'utils/debounce';
import classNames from 'classnames';
import { getAddresses } from 'api/search';
import style from './style.scss';

const AddressSearch = ({ onSelect, className }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const escapeRegexCharacters = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const formAddress = (address) => {
    const { building_name = '', street_number = '', street = '', zipcode = '' } = address;

    const addressLineArr = [];

    if (building_name) {
      addressLineArr.push(building_name);
    }
    addressLineArr.push(`${street_number ? `${street_number} ` : ''}${street}`);
    addressLineArr.push(zipcode);

    return addressLineArr.join(', ');
  };

  const onFetch = debounce((value) => {
    const escapedValue = escapeRegexCharacters(value.trim());
    let suggestions = [];

    if (escapedValue.length !== 0) {
      suggestions = [
        {
          name: 'Not Found',
        },
      ];
      getAddresses({
        q: escapedValue,
      })
        .then((response) => {
          suggestions.splice(0, 0, ...response);

          setSuggestions(suggestions);
        })
        .catch(() => {
          setSuggestions(suggestions);
        });
    } else {
      setSuggestions(suggestions);
    }
  }, 100);

  const onSuggestionsFetchRequested = ({ value }) => {
    onFetch(value);
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => {
    if (suggestion.name) {
      return "Can't find your address?";
    }
    return formAddress(suggestion);
  };

  const renderSuggestion = (suggestion) => {
    if (suggestion.name) {
      return (
        <button type="button" className={`${style.autosuggest}__btn`}>
          Can't find your address?
        </button>
      );
    }
    return (
      <button type="button" className={`${style.autosuggest}__btn`}>
        {formAddress(suggestion)}
      </button>
    );
  };

  const onSuggestionSelected = (e, { suggestion }) => {
    // form submission
    e.preventDefault();

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const theme = useMemo(
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
      },
      suggestionsContainer: {
        position: 'absolute',
        top: '49px',
        width: '100%',
        border: suggestions.length > 0 ? '1px solid #BEBEBE' : 'none',
        borderRadius: 0,
        zIndex: 101,
        maxHeight: '50vh',
        overflowY: 'auto',
        padding: 0,
        backgroundColor: '#FBF9F4',
      },
      suggestionsList: {
        margin: 0,
        padding: 0,
      },
      suggestion: {
        cursor: 'pointer',
        // padding: '10px 20px',
        listStyleType: 'none',
      },
    }),
    [suggestions]
  );

  const inputProps = {
    type: 'search',
    placeholder: 'Enter your address',
    className: 'form-control',
    value,
    name: 'q',
    maxLength: '2048',
    autoCorrect: 'off',
    spellCheck: false,
    onChange,
  };

  return (
    <form className={classNames(style.autosuggest, className)} action="/" onSubmit={(e) => e.preventDefault()}>
      <Autosuggest
        theme={theme}
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        onSuggestionSelected={onSuggestionSelected}
        inputProps={inputProps}
      />
    </form>
  );
};

AddressSearch.propTypes = {
  onSelect: PropTypes.func,
  className: PropTypes.string,
};

export default AddressSearch;
