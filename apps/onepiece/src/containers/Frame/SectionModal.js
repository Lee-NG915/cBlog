import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';

import style from './style.scss';

export default class SectionModal extends Component {
  static animation = 'plain';

  static propTypes = {
    addSection: PropTypes.func.isRequired,
    isShared: PropTypes.bool,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  static defaultProps = {
    isShared: false,
  };

  state = {
    page: 1,
    per_page: 10,
    q: '',
    allowShared: true,
    allowPrivate: !this.props.isShared,

    total_pages: 0,
  };

  client = new ApiClient();

  timestamp = Date.now(); // used for debounce input

  search() {
    const { page, per_page, q, allowPrivate, allowShared } = this.state;
    const params = {
      page,
      per_page,
      q,
    };

    if (allowPrivate && !allowShared) {
      params.is_shared = false;
    } else if (allowShared && !allowPrivate) {
      params.is_shared = true;
    }

    this.client
      .get('/cms_contents', {
        auth: 'strict',
        params,
      })
      .then((res) => {
        this.setState({
          page: res.current_page,
          total_pages: res.total_pages,
          results: res.results,
        });
      })
      .catch((err) =>
        console.error(
          JSON.stringify(
            {
              message: 'Error searching for sections',
              error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
            },
            null,
            2
          )
        )
      );
  }

  submit(e) {
    e.preventDefault();
    this.setState(
      {
        page: 1,
      },
      this.search.bind(this)
    );
  }

  onChange(e) {
    const newTimestamp = Date.now();
    if (newTimestamp - this.timestamp > 500) {
      this.setState(
        {
          q: e.target.value.trim(),
          page: 1,
        },
        this.search.bind(this)
      );
      // replace the old timestamp
      this.timestamp = newTimestamp;
    } else {
      this.setState({
        q: e.target.value.trim(),
      });
    }
  }

  toggleOption(option) {
    const { allowShared, allowPrivate } = this.state;

    let newAllowShared;
    let newAllowPrivate;

    if (option === 'private') {
      newAllowPrivate = !allowPrivate;
      newAllowShared = allowShared;
    } else {
      newAllowPrivate = allowPrivate;
      newAllowShared = !allowShared;
    }

    if (newAllowShared || newAllowPrivate) {
      this.setState(
        {
          allowShared: newAllowShared,
          allowPrivate: newAllowPrivate,
          page: 1,
        },
        this.search.bind(this)
      );
    }
  }

  pagi(num) {
    this.setState(
      {
        // eslint-disable-next-line react/no-access-state-in-setstate
        page: this.state.page + num,
      },
      this.search.bind(this)
    );
  }

  render() {
    const { q, results, allowPrivate, allowShared, page, total_pages } = this.state;
    const { isShared, addSection } = this.props;

    return (
      <div
        onClick={(e) => {
          if (e.target.classList.contains(style.section)) {
            this.context.frame.removeModal();
          }
        }}
        className={style.section}
      >
        <div className={`${style.section}__container`}>
          <form className={`${style.section}__input`} action="/" onSubmit={this.submit.bind(this)}>
            <input
              type="text"
              value={q}
              onChange={this.onChange.bind(this)}
              placeholder="Search sections by name"
              className="form-control"
            />
            {!isShared && (
              <button
                type="button"
                onClick={() => this.toggleOption('private')}
                className={classNames('btn', `${style.section}__checkbox`, {
                  'is-checked': allowPrivate,
                })}
              >
                <span />
                <label>Private</label>
              </button>
            )}
            {!isShared && (
              <button
                type="button"
                onClick={() => this.toggleOption('shared')}
                className={classNames('btn', `${style.section}__checkbox`, {
                  'is-checked': allowShared,
                })}
              >
                <span />
                <label>Shared</label>
              </button>
            )}
          </form>
          {results &&
            (results.length > 0 ? (
              <div className={`${style.section}__results`}>
                {results.map((result) => (
                  <div
                    onClick={() => {
                      addSection(result);
                      this.context.frame.removeModal();
                    }}
                    className={`${style.section}__result`}
                    key={result.id}
                  >
                    <span>{result.name}</span>
                    <span>{result.is_shared ? 'shared' : 'private'}</span>
                  </div>
                ))}
                <div className={`${style.section}__pagi`}>
                  <button type="button" disabled={page === 1} onClick={() => this.pagi(-1)} className="btn">
                    <ReactSVG name="arrow-prev" />
                  </button>
                  <span>
                    {page} / {total_pages}
                  </span>
                  <button type="button" disabled={page === total_pages} onClick={() => this.pagi(1)} className="btn">
                    <ReactSVG name="arrow-next" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${style.section}__results ${style.section}__results--empty`}>No results found.</div>
            ))}
        </div>
      </div>
    );
  }
}
