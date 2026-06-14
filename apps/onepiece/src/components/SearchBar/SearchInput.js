import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import classNames from 'classnames';
import debounce from 'lodash/debounce';
import Autosuggest from 'react-autosuggest';
import { getProductLink } from 'utils/link';
import { trackDYKeywordSearch } from 'utils/tracking';
import { getPageByPermalink, getUrl } from 'pages';
import { Typography } from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import { getProductAutocomplete } from 'api/search';
import style from './style.scss';

export default class SearchInput extends Component {
  static propTypes = {
    isHidden: PropTypes.bool,
    onClose: PropTypes.func,
    iconName: PropTypes.string,
    placeholder: PropTypes.node,

    suggestionPadding: PropTypes.bool,
    onChange: PropTypes.func,
    onClickSuggestion: PropTypes.func,
  };

  static defaultProps = {
    suggestionPadding: true,
  };

  static contextTypes = {
    router: PropTypes.object,
  };

  static escapeRegexCharacters = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  state = {
    value: '',
    suggestions: [],
    noSuggestions: false,
  };

  _mount = false;

  form = createRef();

  trackKeywordSearch = debounce((keywords) => {
    trackDYKeywordSearch(keywords);
  }, 2000);

  componentDidMount() {
    this._mount = true;
    const { isHidden } = this.props;
    const { current: form } = this.form;
    if (!isHidden && form) {
      form.querySelector('input').focus();
    }
  }

  componentDidUpdate(prevProps) {
    // focus the input
    const { isHidden } = this.props;
    const { current: form } = this.form;
    if (prevProps.isHidden && !isHidden && form) {
      form.querySelector('input').focus();
    }
  }

  componentWillUnmount() {
    this._mount = false;
  }

  onChange = (event, { newValue }) => {
    const { value } = this.state;
    const { onChange } = this.props;
    if (onChange && typeof onChange === 'function') {
      onChange(value, newValue, event);
    }
    this.setState({ value: newValue });
  };

  onSuggestionsFetchRequested = debounce(({ value }) => {
    const isInputBlank = value.trim().length === 0;
    const escapedValue = SearchInput.escapeRegexCharacters(value.trim());

    this.trackKeywordSearch(value);

    if (escapedValue.length !== 0) {
      getProductAutocomplete({
        q: escapedValue,
      }).then(
        (response) => {
          // group suggestions under same type together to from sections
          const sections = [
            {
              title: 'Product',
              suggestions: [],
            },
            {
              title: 'Category',
              suggestions: [],
            },
            {
              title: 'Collection',
              suggestions: [],
            },
          ];
          response.forEach((r) => {
            if (r.type === 'product') {
              r.pathname = getProductLink(r.slug);
              sections[0].suggestions.push(r);
            } else if (r.type === 'category') {
              // process to get the link
              const page = getPageByPermalink(r.slug);
              if (page?.url) {
                r.pathname = page.url;
                if (r.name !== page.name) {
                  r.name_highlight = page.name.replace(r.name, r.name_highlight);
                  r.name = page.name;
                }
                sections[1].suggestions.push(r);
              }
            } else if (r.type === 'collection') {
              const page = getPageByPermalink(r.slug);
              if (page?.url) {
                r.pathname = page.url;
                sections[2].suggestions.push(r);
              }
            }
          });

          // add 'view all products' button for product section
          if (sections[0].suggestions.length > 0) {
            sections[0].suggestions.push({
              type: 'customized',
              name: escapedValue,
              name_highlight: 'View all products',
              pathname: getUrl('search'),
              query: { q: escapedValue },
            });
          }
          if (this._mount) {
            this.setState({
              suggestions: sections.filter((section) => section.suggestions.length > 0),
              noSuggestions: !isInputBlank && response.length === 0,
            });
          }
        },
        (err) => {
          console.error(
            JSON.stringify(
              {
                message: 'Search suggestion fetch error',
                error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
              },
              null,
              2
            )
          );
        }
      );
    } else {
      this.setState({
        suggestions: [],
        noSuggestions: !isInputBlank,
      });
    }
  }, 600);

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
      noSuggestions: false,
    });
  };

  clearSuggestionAndFetchRequested = ({ value }) => {
    this.onSuggestionsClearRequested();
    this.onSuggestionsFetchRequested({ value });
  };

  getSectionSuggestions = (section) => section.suggestions;

  getSuggestionValue = (suggestion) => suggestion.name;

  clickSuggestion = (event) => {
    event.stopPropagation();
    const { onClickSuggestion } = this.props;
    this.onClose().then(() => onClickSuggestion && onClickSuggestion());
  };

  renderSuggestion = (suggestion) => {
    const decoratedLink = __BASE_URL__ + suggestion.pathname;
    return (
      <Typography
        level="caption1"
        component="a"
        href={decoratedLink}
        className={classNames({ 'has-image': suggestion.image })}
        onClick={this.clickSuggestion}
      >
        {suggestion.image && <img src={suggestion.image} alt={suggestion.name} />}
        {suggestion.name_highlight ? (
          <span dangerouslySetInnerHTML={{ __html: suggestion.name_highlight }} />
        ) : (
          suggestion.name
        )}
      </Typography>
    );
  };

  renderSectionTitle = (section) => (
    <Typography level="subh3" sx={{ color: '#844025' }}>
      {section.title}
    </Typography>
  );

  onSuggestionSelected = (e, { suggestion, method }) => {
    // hit enter on suggestion, prevent form submit and navigate to target page
    const { router } = this.context;
    if (method === 'enter') {
      e.preventDefault();
      this.onClose().then(() => {
        router.push({
          pathname: suggestion.pathname,
          ...(!!suggestion.query && { query: suggestion.query }),
          state: { isFromSearch: true },
        });
      });
    }
  };

  onSubmit = (e) => {
    const { value } = this.state;
    const { current: form } = this.form;
    e.preventDefault();
    if (form.elements.q.value.trim()) {
      this.onClose().then(() => {
        if (value) {
          window.location.href = `${__BASE_URL__}/search?q=${value}`;
        } else {
          window.location.href = `${__BASE_URL__}/search`;
        }
      });
    }
  };

  onClose = () => {
    const { onClose } = this.props;
    this.setState({
      value: '',
      suggestions: [],
      noSuggestions: false,
    });

    return Promise.resolve(onClose && onClose());
  };

  render() {
    const { suggestions, noSuggestions, value } = this.state;
    const { placeholder, iconName = 'search', suggestionPadding } = this.props;

    const inputProps = {
      type: 'search',
      placeholder: placeholder ? '' : 'Type to search...',
      className: 'form-control',
      value,
      name: 'q',
      maxLength: '2048',
      autoCorrect: 'off',
      spellCheck: false,
      onChange: this.onChange,
      'data-selenium': 'header-search-input',
      'aria-label': 'Type to search...',
    };

    return (
      <div className={`${style.search}__input`}>
        {!placeholder && (
          <span className={`${style.search}__input__icon`}>
            <Search fontSize="xl2" />
          </span>
        )}
        <form
          className={classNames(style.autosuggest, !suggestionPadding && 'cover')}
          // action={`${__BASE_ROUTE__}/search`}
          onSubmit={this.onSubmit}
          ref={this.form}
        >
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.clearSuggestionAndFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            multiSection
            renderSectionTitle={this.renderSectionTitle}
            getSectionSuggestions={this.getSectionSuggestions}
            onSuggestionSelected={this.onSuggestionSelected}
            focusInputOnSuggestionClick={false}
            inputProps={inputProps}
          />
          {placeholder && !value && placeholder}
          {noSuggestions && (
            <div className={`${style.autosuggest}__noSuggestions`}>
              <span>Sorry, no result is found.</span>
            </div>
          )}
        </form>
      </div>
    );
  }
}
