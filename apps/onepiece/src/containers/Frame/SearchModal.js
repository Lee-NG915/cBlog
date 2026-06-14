import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchBar from 'components/SearchBar';
import style from './style.scss';

export default class SearchModal extends Component {
  static animation = 'plain';

  static propTypes = {
    dismiss: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    search: false,
  };

  componentDidMount() {
    this.setState({
      search: true,
    });
  }

  close = (e) => {
    const { frame } = this.context;
    const { dismiss = frame.removeModal } = this.props;
    if (e.target.classList.contains(style.search)) {
      dismiss();
    }
  };

  render() {
    const { search } = this.state;
    const { frame } = this.context;
    const { dismiss = () => frame.removeModal() } = this.props;

    return (
      <div className={style.search} onClick={this.close}>
        <div className={`${style.search}__header`}>
          <SearchBar isHidden={!search} onClose={dismiss} />
        </div>
      </div>
    );
  }
}
